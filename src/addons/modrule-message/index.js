module.exports = PMTbot => {

    const messageProperties = [
        "ban",
        "kick",
        "warn",
        "delete",
        "mute"
    ];

    const noSevereMessageProperties = [
        "warn",
        "delete",
        "mute"
    ];

    const raidProperties = [
        "warn",
        "ban",
        "kick",
        "slowmode"
    ];

    PMTbot.on("ready", () => {
        //Bot is logged in, by now the modrule manager HAS to be exported.

        const modRuleManager = PMTbot.exports.get("modrule.manager");
        //modRuleManager.registerRule("message.raid", raidProperties); //TODO
        modRuleManager.registerRule("message.spam.mentions", messageProperties);
        modRuleManager.registerRule("message.spam.text", messageProperties);
        modRuleManager.registerRule("message.capitals", noSevereMessageProperties);
        modRuleManager.registerRule("message.invite", messageProperties);
        modRuleManager.registerRule("message.badWords", messageProperties);

    });

    require("./rules/capitals")(PMTbot);
    require("./rules/spamMentions")(PMTbot);
    require("./rules/spamText")(PMTbot);
    require('./rules/invite')(PMTbot);
    require("./rules/badWords")(PMTbot);
};