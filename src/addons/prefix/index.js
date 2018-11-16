const {RichEmbed} = require("discord.js");

module.exports = PMTbot => {
    
    PMTbot.addCommand("prefix", {
        category: "Configuration Commands",
        description: "Change ProtectMyTreasure's prefix."
    }, async (message, args) => {
        
        //Check if user is admin or not.
        if (!message.member.permissions.has("ADMINISTRATOR")) {
            return message.channel.send({
                embed: new RichEmbed()
                .setDescription("You do not have permission to use this command.")
                .setColor(0xff0000)
            });
        }

        const newPrefix = args.join(" ");
        const config = PMTbot.storage.get("config", {});
        const guildConfig = config[message.guild.id];
        const oldPrefix = guildConfig.PREFIX;

        if (args.length === 0) {
            //They didn't specify any prefix.
            return message.channel.send(
                new RichEmbed()
                .setDescription(`My prefix is \`${oldPrefix}\`.`)
                .setColor(0x00ff00)
            );
        }

        guildConfig.PREFIX = newPrefix;
        PMTbot.storage.set("config", config);

        return message.channel.send(
            new RichEmbed()
            .setDescription(`My prefix was \`${oldPrefix}\`, but it is now \`${newPrefix}\``)
            .setColor(0x00ff00)
        );

    });

};