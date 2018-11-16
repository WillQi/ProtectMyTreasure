const {RichEmbed, Client} = require("discord.js");
const Enmap = require("enmap");

const StorageEnmap = require("./StorageEnmap");
const ExportMap = require("./ExportMap");
const {DEFAULT_SETTINGS, BOT_OWNERS, COOLDOWN} = require("../../config.json");

class ProtectMyTreasureClient {
    
    constructor () {

        this.client = new Client(); 

        this._callbacks = new Enmap();
        this._cooldowns = new Enmap();
        this.exports = new ExportMap();

        this.commands = new Map();
        this.storage = new StorageEnmap();

        //Command handler.
        this.on("message", async message => {
            if (message.channel.type !== "text" || message.author.bot || !message.guild.available || !this.client.user) return;
            const guildConfigurations = this.storage.get("config", {});
            if (!guildConfigurations[message.guild.id]) {
                //Set configurations.
                guildConfigurations[message.guild.id] = DEFAULT_SETTINGS;
                this.storage.set("config", guildConfigurations);
            }

            const permissions = message.channel.permissionsFor(this.client.user);
            if (!permissions || !permissions.has("SEND_MESSAGES") || !permissions.has("EMBED_LINKS")) return; //We don't have the required permissions to send messages.

            const {PREFIX} = guildConfigurations[message.guild.id];

            const contentLowercase = message.content.toLocaleLowerCase();
            if (!contentLowercase.startsWith(PREFIX.toLocaleLowerCase())) return; //Not our prefix.

            const [command, ...args] = message.content.slice(PREFIX.length).split(/ +/g);
            let commands = this.commands.get(command.toLocaleLowerCase()) || [];

            //What the heck am I doing here.
            if (commands.length === 0) {
                const entries = Array.from(this.commands.values());
                for (const c of entries) {
                    const results = c.filter(cmd => cmd.options.alias && cmd.options.alias.includes(command.toLocaleLowerCase()));
                    if (results.length > 0) commands = commands.concat(results);
                }
            }

            message.channel = message.channel;
            for (const command of commands) {
                if (command.options.botowner && !BOT_OWNERS.includes(message.author.id)) continue; //This command requires you to be the botowner.
                const cooldown = this._cooldowns.get(message.author.id) || 0;
                if (cooldown > Date.now()) return; //They can't execute any command yet. They're on cooldown.
                this._cooldowns.set(message.author.id, Date.now() + COOLDOWN);
                try {
                    const response = command.callback(message, args);
                    if (response && response.then) {
                        //TODO: Check if error is a message failing to send.
                        response.catch(error => {
                            console.error("Error while executing %s", message.content);
                            console.error(error);
                            message.channel.send(
                                new RichEmbed()
                                .setDescription("An error occured while executing that command! It has been reported to the developer.")
                                .setColor(0xff0000)
                            ).catch(() => null);
                        });
                    }
                    return;
                } catch (error) {
                    //TODO: Check if error is a message failing to send.
                    console.error("Error while executing %s", message.content);
                    console.error(error);
                    message.channel.send(
                        new RichEmbed()
                        .setDescription("An error occured while executing that command! It has been reported to the developer.")
                        .setColor(0xff0000)
                    ).catch(() => null);
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
};

module.exports = ProtectMyTreasureClient;