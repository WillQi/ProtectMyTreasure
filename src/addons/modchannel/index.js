const {RichEmbed} = require("discord.js");

module.exports = PMTbot => {

    const logMessage = async (guild, title, message) => {
        const {MOD_CHANNEL} = PMTbot.storage.get("config")[guild.id];
        const channel = PMTbot.client.channels.get(MOD_CHANNEL);
        if (!channel) return;
        try {
            await channel.send(
                new RichEmbed()
                .setTitle(title)
                .setDescription(message)
                .setColor("RANDOM")
            );
        } catch (error) {}
    };

    PMTbot.exports.set("modchannel.log", logMessage);

    PMTbot.addCommand("modchannel", {
        category: "Configuration Commands",
        description: "Set the channel for where warning messages goto."
    }, async message => {
        
        if (!message.member.permissions.has("ADMINISTRATOR")) {
            //Only people with admin can use this.
            try {
                await message.channel.send(
                    new RichEmbed()
                    .setDescription("Only users with the administrator permission can use this command!")
                    .setColor(0xff0000)
                );
            } catch (error) {}
            return;
        }

        const channel = message.mentions.channels.first() || message.channel;
        const config = PMTbot.storage.get("config");
        config[message.guild.id].MOD_CHANNEL = channel.id;
        PMTbot.storage.set("config", config);

        try {
            await message.channel.send(
                new RichEmbed()
                .setDescription(`Any warnings or actions done by the bot will be logged in ${channel}.`)
                .setColor(0x00ff00)
            );
        } catch (error) {}
        return;

    });

};