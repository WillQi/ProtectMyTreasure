//Core system for mod rules.
const ModRuleManager = require("./ModRuleManager");

module.exports = PMTbot => {
    const modRuleManager = new ModRuleManager(PMTbot.storage);
    
};