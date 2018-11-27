const {RichEmbed} = require("discord.js");

module.exports = PMTbot => {
    PMTbot.addCommand("adv-modrule", {
        category: "Configuration Commands",
        description: "Specifically specify what the bot should moderate, this is a more advanced version of `modrule`.",
        alias: ["amod-rule", "amr", "a-modrule", "amodrule"]
    }, async (message, [ruleUnparsed, valueUnparsed]) => {

        if (!message.member.permissions.has("ADMINISTRATOR")) {
            //Only people with admin can use this.
            try {
                await message.channel.send(
                    new RichEmbed()
                    .setDescription("Only users with the administrator permission can use this command!")
                    .setColor(0xff0000)
                );
            } catch (error) {}
            return;
        }
        
        const {PREFIX} = PMTbot.storage.get("config", {})[message.guild.id];

        const modRuleManager = PMTbot.exports.get("modrule.manager");
        const options = modRuleManager.getRuleOptions(ruleUnparsed);
        const isProperty = modRuleManager.doesRuleExist((ruleUnparsed || "").split(".").slice(0, -1).join("."), (ruleUnparsed || "").split(".").slice(-1)[0]) && options.length === 0;
        if (isProperty) {

            if (!valueUnparsed) {
                //Just state the current value of this property.
                try {
                    await message.channel.send(
                        new RichEmbed()
                        .setTitle(`Rule - ${ruleUnparsed.toLocaleLowerCase()}`)
                        .setDescription(`This rule is currently set to ${modRuleManager.hasRuleActive(message.guild, ruleUnparsed.split(".").slice(0, -1).join("."), ruleUnparsed.split(".").slice(-1)[0])}.`)
                        .setColor(0x00ff00)
                    );
                } catch (error) {}
            } else {
                //Set the property?
                const valueParsed = valueUnparsed.toLocaleLowerCase();
                let setRule = false;
                switch (valueParsed) {
                    case "true":
                    case "1":
                    case "allow":
                    case "allowed":
                    case "yes":
                        setRule = true;
                    break;
                }
                modRuleManager.setRule(message.guild, ruleUnparsed.split(".").slice(0, -1).join("."), ruleUnparsed.split(".").slice(-1)[0], setRule);
                try {
                    await message.channel.send(
                        new RichEmbed()
                        .setTitle(`Rule - ${ruleUnparsed.toLocaleLowerCase()}`)
                        .setDescription(`I have set \`${ruleUnparsed.toLocaleLowerCase()}\` to ${setRule ? "true" : "false"}.`)
                        .setColor(0x00ff00)
                    );
                } catch (error) {}
            }

        } else {

            //Ok, well then. Display the rules for that node.

            let onlyContainsProperties = false;
            if (options.length > 0) onlyContainsProperties = modRuleManager.doesRuleExist(ruleUnparsed || "", options[0]);
            try {
                await message.channel.send(
                    new RichEmbed()
                    .setTitle(`Current Node - ${ruleUnparsed ? ruleUnparsed.toLocaleLowerCase() : "Root"}`)
                    .setDescription(`
${
options.map(
    option => `\`${ruleUnparsed ? `${ruleUnparsed}.` : ""}${option}\``
).join("\n")
}

${
    !onlyContainsProperties
    ?
        options.length > 0
        ?
            `Don't understand? If you send \`${PREFIX}adv-modrule ${ruleUnparsed ? `${ruleUnparsed.toLocaleLowerCase()}.` : ""}${options[0]}\` You will see a list of all choices available for that node.`
        :
            `Don't understand? If you send \`${PREFIX}adv-modrule\` You will see a list of all choices available.`
    :
        `Don't understand? If you send \`${PREFIX}adv-modrule ${ruleUnparsed.toLocaleLowerCase()}.${options[0]} true\` You will set this rule to be active. You can replace \`true\` with \`false\` to turn off the rule.`
}
                    `)
                    .setColor(0x00ff00)
                );
            } catch (error) {}
        }
    });
};