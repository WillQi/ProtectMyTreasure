const {Util} = require("discord.js");

const spam = new Map();

module.exports = PMTbot => {

    const log = PMTbot.exports.get("modchannel.log");

    //This will handle repetitive messages.
    PMTbot.on("message", async message => {

        const canIssueModRuleAgainstUser = PMTbot.exports.get("utils.canIssueModRuleAgainstUser");

        if (message.channel.type !== "text" || message.author.bot || !canIssueModRuleAgainstUser(message.member)) return;

        if (spam.has(message.author.id)) {

            const data = spam.get(message.author.id);

            if (data.text !== message.content) {
                return spam.set(message.author.id, {
                    text: message.content,
                    count: 1
                });
            }
            data.count++;
            if (data.count < 3) return; //They need to send at least 3 of the same messages.
            //Ok, what's our course of action?
            const modRuleManager = PMTbot.exports.get("modrule.manager");
            const sendWarningMessage = PMTbot.exports.get("utils.sendWarningMessage")(message);
            const warn = PMTbot.exports.get("warning.warn");

            if (modRuleManager.hasRuleActive(message.guild, "message.spam.text", "ban") && message.member.bannable) {
                await message.member.ban("[Automated] Spam");
                return log(
                    message.guild,
                    "Banned User - Spam",
                    `${message.author} was banned for spam.`
                );
            }

            if (modRuleManager.hasRuleActive(message.guild, "message.spam.text", "kick") && message.member.kickable) {
                await message.member.kick("[Automated] Spam");
                return log(
                    message.guild,
                    "Kicked User - Spam",
                    `${message.author} was kicked for spam.`
                );
            }

            if (modRuleManager.hasRuleActive(message.guild, "message.spam.text", "mute") && message.channel.manageable) {
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

            if (modRuleManager.hasRuleActive(message.guild, "message.spam.text", "warn") && message.member.bannable) {
                warn(message.guild, message.author);
                log(
                    message.guild,
                    "Warned User - Spam",
                    `${message.author} was warned in ${message.channel} due to the message \`${Util.escapeMarkdown(message.content.slice(0, 1000))}\``
                );
                sendWarningMessage("Please do not spam.");
            }

            if (modRuleManager.hasRuleActive(message.guild, "message.spam.text", "delete") && message.deletable) {
                await message.delete();
                log(
                    message.guild,
                    "Message Deleted - Spam",
                    `${message.author}'s message in ${message.channel} \`${Util.escapeMarkdown(message.content.slice(0, 1000))}\` was removed.`
                );
                sendWarningMessage("Please do not spam.");
            }
        } else {
            spam.set(message.author.id, {
                text: message.content,
                count: 1
            });
        }
        
    });
};