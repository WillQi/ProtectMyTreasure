const {RichEmbed} = require("discord.js");

module.exports = PMTbot => {
    
    PMTbot.addCommand("help", {
        category: "Configuration Commands",
        description: "Display this help message."
    }, async message => {
        const config = PMTbot.storage.get("config", {});
        const guildConfig = config[message.guild.id];

        const embed = new RichEmbed()
        .setTitle("ProtectMyTreasure | Commands")
        .setDescription("Below you may find a list of all the commands of ProtectMyTreausre.")
        .setColor(0x00ff00)
        .setFooter(`The prefix for this guild is ${guildConfig.PREFIX}`);

        //Add embed's commands and send message.
        const categories = {};
        PMTbot.commands.forEach(commands => {
            for (const command of commands) {
                if (command.options.botowner) continue; //We don't display botowner commands.
                const category = command.options.category || "Uncategorized Commands";
                if (!categories[category]) categories[category] = [];
                categories[category].push({
                    name: command.name,
                    description: command.options.description || "Mysterious command!"
                });
            }
        });
        for (const category in categories) {
            embed.addField(category, categories[category].map(command => `\`${command.name}\` - ${command.description}`));
        }
        return message.channel.send(embed);

    });

    //Just some handlers.
    PMTbot.on("error", error => console.error("Connection error!", error.message));
    PMTbot.on("warn", console.warn);
    PMTbot.on("disconnect", () => console.log("ProtectMyTreasure has disconnected from Discord."));

    PMTbot.on("ready", () => {
        if (!PMTbot.client.user) return; //Gotta get rid of that ts warning. smh
        PMTbot.client.user.setActivity("for criminals! | p!help", {type: "WATCHING"});
        console.log("ProtectMyTreasure is ready.");
    });


    PMTbot.on("raw", async (event) => {
        const events = {
            MESSAGE_REACTION_REMOVE: "messageReactionRemove",
            MESSAGE_REACTION_ADD: "messageReactionAdd"
        };
        if (!Object.keys(events).includes(event.t)) return; //We don't listen to that.
        const data = event.d;
    
        //Gotta get the message.
        const user = PMTbot.client.users.get(data.user_id) || await PMTbot.client.fetchUser(data.user_id);
        const channel = PMTbot.client.channels.get(data.channel_id) || await user.createDM();
        if (!channel) return;
        if (channel.messages.has(data.message_id)) return; //Already cached.
        let message;
        try {
            message = await channel.fetchMessage(data.message_id);
        } catch (error) {
            return;
        }
    
        //and that reaction.
        const emoji = data.emoji.id ? data.emoji.id : data.emoji.name;
        const reaction = message.reactions.get(emoji);
    
        //Emit the event.
        PMTbot.client.emit(events[event.t], reaction, user);
    });

};