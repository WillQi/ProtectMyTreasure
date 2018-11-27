module.exports = PMTbot => {

    const _addWarningConfig = (guild, user) => {
        const warnings = PMTbot.storage.get("warnings", {});
        if (!warning[guild.id]) {
            warnings[guild.id] = {
                [user.id]: 0
            };
        } else if (!warnings[guild.id][user.id]) warnings[guild.id][user.id] = 0;
        PMTbot.storage.set("warnings", warnings);
    };

    const _removeWarningConfig = (guild, user) => {
        const warnings = PMTbot.storage.get("warnings", {});
        if (warnings[guild.id] && warnings[guild.id][user.id]) delete warnings[guild.id][user.id];
        PMTbot.storage.set("warnings", warnings);
    };

    const getWarningsForUser = (guild, user) => {
        _addWarningConfig(guild, user);
        const warnings = PMTbot.storage.get("warnings", {});
        return warnings[guild.id][user.id];
    };

    const addWarning = (guild, user) => {
        _addWarningConfig(guild, user);
        const warnings = PMTbot.storage.get("warnings", {});
        warnings[guild.id][user.id]++;
        PMTbot.storage.set("warnings", warnings);
    };

    const canBan = (guild, user) => {
        _addWarningConfig(guild, user);
        const warningsRequiredForBan = getWarningsRequiredForGuild(guild);

        const member = guild.member(PMTbot.client.user);
        const targetMember = guild.member(user);

        if (!targetMember) throw new Error("You can't ban a member who's not in the guild.");
        return warningsRequiredForBan < getWarningsForUser(guild, user) && member.permissions.has(["BAN_MEMBERS"] && targetMember.bannable);
    };

    const getWarningsRequiredForGuild = guild => PMTbot.storage.get("config", {})[guild.id] || 0;

    const warn = async (guild, user) => {
        _addWarningConfig(guild, user); //If they aren't already in the configuration.
        addWarning(guild, user);
        if (canBan(guild, user)) {
            //We can ban them.
            try {
                await guild.ban(user, `User reached ${getWarningsForUser(guild, user)} warnings.`);
            } catch (error) {
                throw new Error(`Was unable to ban ${user} in ${guild}.`);
            }
        }
        _removeWarningConfig(guild, user); //No need to store it in the system anymore.
    };

    PMTbot.exports.set("warning.warn", warn);
    PMTbot.exports.set("warning.getWarningsForUser", getWarningsForUser);
};