const getResponse = require("./functions/getResponse");
const getSelection = require("./functions/getSelection");
const getNumericalResponse = require("./functions/getNumericalResponse");

module.exports = PMTbot => {
    
    PMTbot.exports.set("utils.getResponse", getResponse);

    PMTbot.exports.set("utils.getSelection", getSelection);

    PMTbot.exports.set("utils.getNumericalResponse", getNumericalResponse);

};