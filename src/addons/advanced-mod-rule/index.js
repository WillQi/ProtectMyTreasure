module.exports = PMTbot => {
    PMTbot.addCommand("adv-modrule", {
        category: "Configuration Commands",
        description: "Specifically specify what the bot should moderate, this is a more advanced version of `modrule`.",
        alias: ["amod-rule", "amr", "a-modrule", "amodrule"]
    }, async (message, [ruleUnparsed, valueUnparsed]) => {
        
    });
};