const {Role} = require("discord.js");

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

    const handleMember = async member => {
        const canIssueModRuleAgainstUser = PMTbot.exports.get("utils.canIssueModRuleAgainstUser");
        const modRuleManager = PMTbot.exports.get("modrule.manager");

        //Member perhaps changed their name.
        const name = member.displayName;
        const hasBadWord = name.toLocaleLowerCase().split(/ +/).some(word => BAD_WORDS.includes(word));

        if (canIssueModRuleAgainstUser(member) && hasBadWord) {

            if (modRuleManager.hasRuleActive(member.guild, "user.name.badWords", "ban") && member.bannable) {
                await member.ban("[Automated] Bad Words");
                return log(
                    member.guild,
                    "Banned User - Bad Words",
                    `${member.user} was banned for having a username with bad words.`
                );
            }

            if (modRuleManager.hasRuleActive(member.guild, "user.name.badWords", "kick") && member.kickable) {
                await member.kick("[Automated] Bad Words");
                return log(
                    member.guild,
                    "Kicked User - Bad Words",
                    `${member.user} was kicked for having a username with bad words.`
                );
            }

            if (modRuleManager.hasRuleActive(member.guild, "user.name.badWords", "change") && Role.comparePositions(member.guild.me.highestRole, member.highestRole) > 0) {
                const filteredName = name.split(/ +/).filter(word => !BAD_WORDS.includes(word.toLocaleLowerCase())).join(" ") || "Person";
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