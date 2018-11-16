module.exports = PMTbot => {
    PMTbot.addCommand("modrule", {
        category: "Configuration Commands",
        description: "Toggle on or off certain rules for the bot to follow while moderating.",
        alias: ["mod-rule", "mr"]
    }, async (message, [ruleUnparsed, valueUnparsed]) => {
        
    });
};