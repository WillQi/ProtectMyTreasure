module.exports = PMTbot => {

    const messageProperties = [
        "ban",
        "kick",
        "warn",
        "delete",
        "mute"
    ];

    PMTbot.on("ready", () => {
        //Bot is logged in, by now the modrule manager HAS to be exported.

        const modRuleManager = PMTbot.exports.get("modrule.manager");
        modRuleManager.registerRule("message.raid", messageProperties);
        modRuleManager.registerRule("message.spam", messageProperties);
        modRuleManager.registerRule("message.capitals", messageProperties);
        modRuleManager.registerRule("message.emojiSpam", messageProperties);
        modRuleManager.registerRule("message.invite", messageProperties);
        modRuleManager.registerRule("message.swears", messageProperties);

    });

    require("./rules/capitals")(PMTbot);
};