const Enmap = require("enmap");
const STORAGE_KEY = "modrules";

/**
 * Manages the mod rules of a guild.
 */
class ModRuleManager {

    constructor (storage) {
        this.storage = storage;
        this.ruleStorage = storage.get(STORAGE_KEY, {});
        this.modrules = new Enmap();

        this.registerRule("message.spam", ["ban"]);
    }

    /**
     * Retrieve the value(s) a guild has for a rule.
     * @param {import("discord.js").Guild | string} guildResolvable Guild ID or guild object.
     * @param {string} rule Rule to check property(s) for.
     * @param {string} property Property we want to find out for this rule.
     */
    isRuleActive (guildResolvable, rule, property) {
        if (!this.doesRuleExist(rule, property)) throw new Error("Rule specified does not exist!");
        const guildID = guildResolvable.id || guildResolvable;
        const guildRules = this.ruleStorage[guildID] || {};
        if (!guildResolvable[rule.toLocaleLowerCase()]) return false;
        return !!guildRules[rule.toLocaleLowerCase()][property.toLocaleLowerCase()];
    }

    /**
     * Checks to see if a rule exists.
     * @param {string} rule Rule to check if it exists. 
     * @param {string} property Property to check if it exists.
     */
    doesRuleExist (rule, property) {
        const ruleParts = rule.toLocaleLowerCase().split(".");
        let currentDir = this.modrules.get(ruleParts[0]);
        if (!currentDir) return false;
        ruleParts.splice(0, 1);
        while (ruleParts.length > 0) {
            currentDir = currentDir[ruleParts[0]];
            if (!currentDir) return false;
            ruleParts.splice(0, 1);
        }
        return currentDir[property.toLocaleLowerCase()] !== undefined;
    }

    /**
     * Set a rule for a guild to the 
     * @param {import("discord.js").Guild | string} guildResolvable Guild ID or guild object.
     * @param {string} rule Rule to set property for.
     * @param {string} property Property we want to set.
     * @param {boolean} value Is this rule going to be active or not? 
     */
    setRule (guildResolvable, rule, property, value) {
        if (!this.doesRuleExist(rule, property)) throw new Error("Rule specified does not exist!");
        const guildID = guildResolvable.id || guildResolvable;
        const guildRules = this.ruleStorage[guildID] || {};
        if (!guildRules[rule.toLocaleLowerCase()]) guildRules[rule.toLocaleLowerCase()] = {};
        guildRules[rule.toLocaleLowerCase()][property.toLocaleLowerCase()] = value;
        this.ruleStorage[guildID] = guildRules;
        this._save();
    }

    /**
     * Register a rule into the mod rule manager.
     * @param {string} rule Rule to register.
     * @param {string[] | string} properties Property(s) to register.
     */
    registerRule (rule, properties) {
        if (!Array.isArray(properties)) properties = [properties];
        const ruleParts = rule.toLocaleLowerCase().split(".");
        const ROOT_PART = ruleParts[0];
        if (!this.modrules.get(ROOT_PART)) this.modrules.set(ROOT_PART, {});
        const rootDir = this.modrules.get(ROOT_PART);
        let currentDir = rootDir;
        ruleParts.splice(0, 1);
        while (ruleParts.length > 0) {
            if (!currentDir[ruleParts[0]]) currentDir[ruleParts[0]] = {};
            currentDir = currentDir[ruleParts[0]];
            ruleParts.splice(0, 1);
        }
        if (Object.values(currentDir).some(val => typeof val !== "boolean")) throw new Error(`"${rule}" is an incomplete rule. There are existing child nodes in this parent node.`);
        for (const property of properties) currentDir[property] = false;
        this.modrules.set(ROOT_PART, rootDir);
    }

    /**
     * Retrieve all the choices the user can make at this point with their current query.
     * @param {string} query Our current choices.
     */
    getRuleOptions (query) {
        const queryParts = query.toLocaleLowerCase().split(".");
        let currentDir = this.modrules.get(ruleParts[0]);
        if (!currentDir) return [];
        queryParts.splice(0, 1);
        while (queryParts.length > 0) {
            currentDir = currentDir[queryParts[0]];
            if (!currentDir) return [];
            queryParts.splice(0, 1);
        }
        return Object.keys(currentDir);
    }

    _save () {
        this.storage.set(STORAGE_KEY, this.ruleStorage);
    }

}

module.exports = ModRuleManager;