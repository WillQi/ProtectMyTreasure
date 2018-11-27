const {Util} = require("discord.js");

const BAD_WORDS = [
    "ass",
    "fuck",
    "shit",
    "fucking",
    "asshole",
    "bastard",
    "bitch",
    "cunt",
    "bollocks",
    "wanker",
    "wank",
    "pussy",
    "vagina",
    "penis",
    "boobs",
    "piss",
    "blowjob"
];

module.exports = PMTbot => {
    const log = PMTbot.exports.get("modchannel.log");

    //This will handle messages with bad words.
    PMTbot.on("message", async message => {

        const canIssueModRuleAgainstUser = PMTbot.exports.get("utils.canIssueModRuleAgainstUser");

        const hasSwear = message.content.toLocaleLowerCase().split(/ +/).some(word => BAD_WORDS.includes(word));

        if (message.channel.type !== "text" || message.author.bot || !canIssueModRuleAgainstUser(message.member) || !hasSwear) return;
        
        //Ok, what's our course of action?
        const modRuleManager = PMTbot.exports.get("modrule.manager");
        const sendWarningMessage = PMTbot.exports.get("utils.sendWarningMessage")(message);
        const warn = PMTbot.exports.get("warning.warn");

        if (modRuleManager.hasRuleActive(message.guild, "message.badWords", "ban") && message.member.bannable) {
            await message.member.ban("[Automated] Bad Words");
            return log(
                message.guild,
                "Banned User - Bad Words",
                `${message.author} was banned for sending a message with censored words.`
            );
        }

        if (modRuleManager.hasRuleActive(message.guild, "message.badWords", "kick") && message.member.kickable) {
            await message.member.kick("[Automated] Bad Words");
            return log(
                message.guild,
                "Kicked User - Bad Words",
                `${message.author} was kicked for sending a message with censored words.`
            );
        }

        if (modRuleManager.hasRuleActive(message.guild, "message.badWords", "mute") && message.channel.manageable) {
            await message.channel.overwritePermissions(message.author, {
                SEND_MESSAGES: false
            });
            log(
                message.guild,
                "Muted User - Bad Words",
                `${message.author} was muted in ${message.channel} due to the message \`${Util.escapeMarkdown(message.content.slice(0, 1000))}\``
            );
            sendWarningMessage("Langauge!");
        }

        if (modRuleManager.hasRuleActive(message.guild, "message.badWords", "warn") && message.member.bannable) {
            warn(message.guild, message.author);
            log(
                message.guild,
                "Warned User - Bad Words",
                `${message.author} was warned in ${message.channel} due to the message \`${Util.escapeMarkdown(message.content.slice(0, 1000))}\``
            );
            sendWarningMessage("Langauge!");
        }

        if (modRuleManager.hasRuleActive(message.guild, "message.badWords", "delete") && message.deletable) {
            await message.delete();
            log(
                message.guild,
                "Message Deleted - Bad Words",
                `${message.author}'s message in ${message.channel} \`${Util.escapeMarkdown(message.content.slice(0, 1000))}\` was removed.`
            );
            sendWarningMessage("Langauge!");
        }
        
    });
};