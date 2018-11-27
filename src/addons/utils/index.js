const getResponse = require("./functions/getResponse");
const getSelection = require("./functions/getSelection");
const getNumericalResponse = require("./functions/getNumericalResponse");
const sendWarningMessage = require("./functions/sendWarningMessage");
const canIssueModRuleAgainstUser = require("./functions/canIssueModRuleAgainstUser");

module.exports = PMTbot => {
    
    PMTbot.exports.set("utils.getResponse", getResponse);

    PMTbot.exports.set("utils.getSelection", getSelection);

    PMTbot.exports.set("utils.getNumericalResponse", getNumericalResponse);

    PMTbot.exports.set("utils.sendWarningMessage", sendWarningMessage);

    PMTbot.exports.set("utils.canIssueModRuleAgainstUser", canIssueModRuleAgainstUser);

};