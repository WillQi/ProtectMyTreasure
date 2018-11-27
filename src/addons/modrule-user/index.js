module.exports = PMTbot => {

    const userProperties = [
        "ban",
        "kick",
        "change"
    ];

    PMTbot.on("ready", () => {
        //Bot is logged in, by now the modrule manager HAS to be exported.

        const modRuleManager = PMTbot.exports.get("modrule.manager");
        modRuleManager.registerRule("user.name.badWords", userProperties);
        modRuleManager.registerRule("user.name.invite", userProperties);

    });


    require("./rules/badWords")(PMTbot);
    require("./rules/invite")(PMTbot);
};