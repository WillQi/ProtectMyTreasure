const {Role} = require("discord.js");

module.exports = PMTbot => {

    const log = PMTbot.exports.get("modchannel.log");

    const handleMember = async member => {
        const canIssueModRuleAgainstUser = PMTbot.exports.get("utils.canIssueModRuleAgainstUser");
        const modRuleManager = PMTbot.exports.get("modrule.manager");

        //Member perhaps changed their name.
        const name = member.displayName;

        const INVITE_REGEX = /(https?:\/\/)?(www\.)?(discord\.(gg|io|me|li)|discordapp\.com\/invite)\/.+[a-z]/gi;
        
        const invites = (name.match(INVITE_REGEX) || []).length;

        if (canIssueModRuleAgainstUser(member) && invites > 0) {

            if (modRuleManager.hasRuleActive(member.guild, "user.name.invite", "ban") && member.bannable) {
                await member.ban("[Automated] Invites");
                return log(
                    member.guild,
                    "Banned User - Advertising",
                    `${member.user} was banned for having a username with an invite.`
                );
            }

            if (modRuleManager.hasRuleActive(member.guild, "user.name.invite", "kick") && member.kickable) {
                await member.kick("[Automated] Invites");
                return log(
                    member.guild,
                    "Kicked User - Advertising",
                    `${member.user} was kicked for having a username with an invite.`
                );
            }

            if (modRuleManager.hasRuleActive(member.guild, "user.name.invite", "change") && Role.comparePositions(member.guild.me.highestRole, member.highestRole) > 0) {
                const filteredName = name.replace(INVITE_REGEX, "").replace(/ +/g, "") || "Person";
                await member.setNickname(filteredName);
                return log(
                    member.guild,
                    "Changed Nickname - Advertising",
                    `${member}'s nickname was changed.`
                );
            }

        }
    };

    PMTbot.on("guildMemberUpdate", (_, member) => handleMember(member));
    PMTbot.on("guildMemberAdd", member => handleMember(member));
};