const {Util} = require("discord.js");
module.exports = PMTbot => {

    const log = PMTbot.exports.get("modchannel.log");

    //This will handle messages with mass emojis in a row.
    PMTbot.on("message", async message => {

        const canIssueModRuleAgainstUser = PMTbot.exports.get("utils.canIssueModRuleAgainstUser");

        const mentions = (message.content.match(/<(#|@!|@|@&)\d+>/g) || []).length;
        
        const messageWithoutMentions = message.content.replace(/<(#|@!|@|@&)\d+>/g, "");

        if (message.channel.type !== "text" || message.author.bot || !canIssueModRuleAgainstUser(message.member) || mentions < 6 || (messageWithoutMentions.length > 100 && mentions > 6)) return;
        //Ok, what's our course of action?
        const modRuleManager = PMTbot.exports.get("modrule.manager");
        const sendWarningMessage = PMTbot.exports.get("utils.sendWarningMessage")(message);
        const warn = PMTbot.exports.get("warning.warn");

        if (modRuleManager.hasRuleActive(message.guild, "message.spam.mentions", "ban") && message.member.bannable) {
            await message.member.ban("[Automated] Spam");
            return log(
                message.guild,
                "Banned User - Spam",
                `${message.author} was banned for spam.`
            );
        }

        if (modRuleManager.hasRuleActive(message.guild, "message.spam.mentions", "kick") && message.member.kickable) {
            await message.member.kick("[Automated] Spam");
            return log(
                message.guild,
                "Kicked User - Spam",
                `${message.author} was kicked for spam.`
            );
        }

        if (modRuleManager.hasRuleActive(message.guild, "message.spam.mentions", "mute") && message.channel.manageable) {
            await message.channel.overwritePermissions(message.author, {
                SEND_MESSAGES: false
            });
            log(
                message.guild,
                "Muted User - Spam",
                `${message.author} was muted in ${message.channel} due to the message \`${Util.escapeMarkdown(message.content.slice(0, 1000))}\``
            );
            sendWarningMessage("Please do not spam.");
        }

        if (modRuleManager.hasRuleActive(message.guild, "message.spam.mentions", "warn") && message.member.bannable) {
            warn(message.guild, message.author);
            log(
                message.guild,
                "Warned User - Spam",
                `${message.author} was warned in ${message.channel} due to the message \`${Util.escapeMarkdown(message.content.slice(0, 1000))}\``
            );
            sendWarningMessage("Please do not spam.");
        }

        if (modRuleManager.hasRuleActive(message.guild, "message.spam.mentions", "delete") && message.deletable) {
            await message.delete();
            log(
                message.guild,
                "Message Deleted - Spam",
                `${message.author}'s message in ${message.channel} \`${Util.escapeMarkdown(message.content.slice(0, 1000))}\` was removed.`
            );
            sendWarningMessage("Please do not spam.");
        }
        
    });
};