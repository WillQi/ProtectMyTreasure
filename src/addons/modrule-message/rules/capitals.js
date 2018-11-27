const {Util} = require("discord.js");
module.exports = PMTbot => {

    const log = PMTbot.exports.get("modchannel.log");

    //This will handle messages with the majority of the message being all caps.
    PMTbot.on("message", async message => {

        const canIssueModRuleAgainstUser = PMTbot.exports.get("utils.canIssueModRuleAgainstUser");

        const split = message.content.split(/ +/g);
        const allCapWords = split.filter(word => word.toLocaleUpperCase() === word).length;
        const normalWords = split.length - allCapWords;
        if (message.channel.type !== "text" || message.author.bot || allCapWords < normalWords || message.content.length < 9 || !canIssueModRuleAgainstUser(message.member)) return;

        //Ok, what's our course of action?
        const modRuleManager = PMTbot.exports.get("modrule.manager");
        const sendWarningMessage = PMTbot.exports.get("utils.sendWarningMessage")(message);
        const warn = PMTbot.exports.get("warning.warn");

        if (modRuleManager.hasRuleActive(message.guild, "message.capitals", "warn") && message.member.bannable) {
            warn(message.guild, message.author);
            log(
                message.guild,
                "Warned User - Capitals",
                `${message.author} was warned in ${message.channel} due to the message \`${Util.escapeMarkdown(message.content.slice(0, 1000))}\``
            );
            sendWarningMessage("Please do not use so many capitals.");
        }

        if (modRuleManager.hasRuleActive(message.guild, "message.capitals", "mute") && message.channel.manageable) {
            await message.channel.overwritePermissions(message.author, {
                SEND_MESSAGES: false
            });
            log(
                message.guild,
                "Muted User - Capitals",
                `${message.author} was muted in ${message.channel} due to the message \`${Util.escapeMarkdown(message.content.slice(0, 1000))}\``
            );
            sendWarningMessage("Please do not use so many capitals, you have been muted for an hour.");
        }

        if (modRuleManager.hasRuleActive(message.guild, "message.capitals", "delete") && message.deletable) {
            await message.delete();
            log(
                message.guild,
                "Message Deleted - Capitals",
                `${message.author}'s message in ${message.channel} \`${Util.escapeMarkdown(message.content.slice(0, 1000))}\` was removed due to mass capitals.`
            );
            sendWarningMessage("Please do not use so many capitals.");
        }
        
    });
};