const {RichEmbed} = require("discord.js");

module.exports = PMTbot => {

    /*
        Cases where this should activate
        ======
        HELLO WORLD
        RGTFGDEFRFSDAEWRETHYJHGDFRE
        why must orange BE A REAL COLOR
    */

    //This will handle messages with the majority of the message being all caps.
    PMTbot.on("message", async message => {
        if (message.channel.type !== "text" || message.author.bot) return;
        const split = message.content.split(/ +/g);
        const allCapWords = split.filter(word => word.toLocaleUpperCase() === word).length;
        const normalWords = split.length - allCapWords;

        if (allCapWords < normalWords || message.content.length < 9) return;
        //Ok, what's our course of action?
        const modRuleManager = PMTbot.exports.get("modrule.manager");

        if (modRuleManager.hasRuleActive(message.guild, "message.capitals", "delete") && message.deletable) {
            await message.delete();
            try {
                await (await message.reply(
                    new RichEmbed()
                    .setDescription("Please do not use so many capitals.")
                    .setColor(0xff0000)
                )).delete(10000);
            } catch (error) {}
            return;
        }
        
    });
};