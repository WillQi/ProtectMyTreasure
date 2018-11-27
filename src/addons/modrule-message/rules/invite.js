const {Util} = require("discord.js");

module.exports = PMTbot => {
    
    const log = PMTbot.exports.get("modchannel.log");

    //This will handle messages with invites.
    PMTbot.on("message", async message => {

        const canIssueModRuleAgainstUser = PMTbot.exports.get("utils.canIssueModRuleAgainstUser");

        const invites = (message.content.match(/(https?:\/\/)?(www\.)?(discord\.(gg|io|me|li)|discordapp\.com\/invite)\/.+[a-z]/gi) || []).length;

        if (message.channel.type !== "text" || message.author.bot || !canIssueModRuleAgainstUser(message.member) || invites === 0) return;
        
        //Ok, what's our course of action?
        const modRuleManager = PMTbot.exports.get("modrule.manager");
        const sendWarningMessage = PMTbot.exports.get("utils.sendWarningMessage")(message);
        const warn = PMTbot.exports.get("warning.warn");

        if (modRuleManager.hasRuleActive(message.guild, "message.invite", "ban") && message.member.bannable) {
            await message.member.ban("[Automated] Invites");
            return log(
                message.guild,
                "Banned User - Advertising",
                `${message.author} was banned for sending an invite.`
            );
        }

        if (modRuleManager.hasRuleActive(message.guild, "message.invite", "kick") && message.member.kickable) {
            await message.member.kick("[Automated] Invites");
            return log(
                message.guild,
                "Kicked User - Advertising",
                `${message.author} was kicked for sending an invite.`
            );
        }

        if (modRuleManager.hasRuleActive(message.guild, "message.invite", "mute") && message.channel.manageable) {
            await message.channel.overwritePermissions(message.author, {
                SEND_MESSAGES: false
            });
            log(
                message.guild,
                "Muted User - Advertising",
                `${message.author} was muted in ${message.channel} due to the message \`${Util.escapeMarkdown(message.content.slice(0, 1000))}\``
            );
            sendWarningMessage("Please do not advertise.");
        }

        if (modRuleManager.hasRuleActive(message.guild, "message.invite", "warn") && message.member.bannable) {
            warn(message.guild, message.author);
            log(
                message.guild,
                "Warned User - Advertising",
                `${message.author} was warned in ${message.channel} due to the message \`${Util.escapeMarkdown(message.content.slice(0, 1000))}\``
            );
            sendWarningMessage("Please do not advertise.");
        }

        if (modRuleManager.hasRuleActive(message.guild, "message.invite", "delete") && message.deletable) {
            await message.delete();
            log(
                message.guild,
                "Message Deleted - Advertising",
                `${message.author}'s message in ${message.channel} \`${Util.escapeMarkdown(message.content.slice(0, 1000))}\` was removed.`
            );
            sendWarningMessage("Please do not advertise.");
        }
        
    });

};