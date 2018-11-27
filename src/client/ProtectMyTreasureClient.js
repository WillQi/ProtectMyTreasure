const {Client, RichEmbed} = require("discord.js");
const Enmap = require("enmap");

const StorageEnmap = require("./StorageEnmap");
const ExportMap = require("./ExportMap");
const {DEFAULT_SETTINGS, BOT_OWNERS, COOLDOWN} = require("../../config.json");

class ProtectMyTreasureClient {
    
    constructor () {

        this.client = new Client({
            disableEveryone: true
        }); 

        this._callbacks = new Enmap();
        this._cooldowns = new Enmap();
        this.exports = new ExportMap();

        this.commands = new Map();
        this.storage = new StorageEnmap();

        //Command handler.
        this.on("message", async message => {
            if (!this._isValidMessage(message)) return;
            const {PREFIX} = this.storage.get("config", {})[message.guild.id];
            const [unparsedCommand, ...args] = message.content.slice(PREFIX.length).split(/ +/);
            const commands = this._getMatchingCommands(unparsedCommand.toLocaleLowerCase());
            for (const command of commands) {
                if ((command.options.botowner && BOT_OWNERS.includes(message.author.id)) || !command.options.botowner) {
                    this._cooldowns.set(message.author.id, Date.now() + COOLDOWN);
                    try {
                        const response = command.callback(message, args);
                        if (response instanceof Promise) response.catch(error => this._handleCommandHandlerError(message, error));
                    } catch (error) {
                        this._handleCommandHandlerError(message, error);
                    }
                    break; //Don't run any more commands.
                }
            }

        });
    }

    /**
     * Listen to an discord.js event.
     * @param {string} event Event to listen to.
     * @param {(...args: any[]) => Promise | void} callback Callback for the event.
     */
    on (event, callback) {
        this._callbacks.ensure(event, []);
        if (this._callbacks.get(event).length === 0) {
            //Create an event listener for this event.
            this.client.on(event, (...args) => {
                const cbs = this._callbacks.get(event);
                for (const callback of cbs) callback.apply(null, args);
            });
        }
        this._callbacks.push(event, callback);
    }

    /**
     * Add a command to the bot.
     * @param {string} name 
     * @param {CommandOptions} options 
     * @param {(message: import('discord.js').Message, args: string[]) => void} callback 
     */
    addCommand (name, options, callback) {
        name = name.toLocaleLowerCase();

        if (!options) {
            options = {
                category: "Uncategorized Category",
                description: "Mysterious command!"
            };
        }

        if (options.alias) options.alias = options.alias.map(command => command.toLocaleLowerCase());

        const commands = this.commands.get(name) || [];
        commands.push({
            name,
            options,
            callback
        });
        this.commands.set(name, commands);

    }

    /**
     * Key to use for storage.
     * @param {string} key Key to use to decrypt/encrypt storage.
     */
    async setupStorage (key) {
        this.storage.setKey(key);
        await this.storage.defer;
    }

    /**
     * Login to the client.
     * @param {string} token Token to login with.
     */
    login (token) {
        return this.client.login(token);
    }


    /**
     * Error handler for command handler.
     * @param {import("discord.js").Message} message
     * @param {Error} error
     * @private
     */
    _handleCommandHandlerError (message, error) {
        console.error("Error while executing %s", message.content);
        console.error(error);
        message.channel.send(
            new RichEmbed()
            .setDescription("An error occured while executing that command! It has been reported to the developer.")
            .setColor(0xff0000)
        ).catch(() => null);
    }

    /**
     * Adds a guild to the configuration storage if they are not in it already.
     * @param {import("discord.js").Guild} guild
     * @private
     */
    _addToConfig (guild) {
        const guildConfigurations = this.storage.get("config", {});
        if (!guildConfigurations[guild.id]) {
            //Set configurations.
            guildConfigurations[guild.id] = DEFAULT_SETTINGS;
            this.storage.set("config", guildConfigurations);
        }
    }

    /**
     * Validates whether or not a message should run any commands.
     * @param {import("discord.js").Message} message
     * @private
     */
    _isValidMessage (message) {
        if (message.channel.type !== "text" || message.author.bot || !message.guild.available) return false; //Message is not a TextChannel, user is a bot, or the guild isn't available.
        const permissions = message.channel.permissionsFor(this.client.user);
        if (!permissions || !permissions.has(["SEND_MESSAGES", "EMBED_LINKS"])) return false; //Bot cannot send messages to this channel.

        //Are they on cooldown?
        const cooldown = this._cooldowns.get(message.author.id) || 0;
        if (cooldown > Date.now()) return false; //They are still on cooldown.

        this._addToConfig(message.guild); //If they aren't in the configuration already, add them.
        const {PREFIX} = this.storage.get("config", {})[message.guild.id];
        return message.content.toLocaleLowerCase().startsWith(PREFIX.toLocaleLowerCase());
    }

    /**
     * Return any command objects matching the command provided.
     * @param {string} command
     * @private
     */
    _getMatchingCommands (command) {
        const commands = (this.commands.get(command) || []);
        //Get alias commands
        const entries = Array.from(this.commands.values());
        for (const similarCommandGroups of entries) { //similarCommandGroups is a array of commands with the same name. (e.g. adding 2 commands with the name "test")
            for (const c of similarCommandGroups) {
                if (c.options.alias && c.options.alias.includes(command)) { //Command is included in this command's alias.
                    commands.push(c);
                }
            }            
        }
        return commands;
    }

};

module.exports = ProtectMyTreasureClient;