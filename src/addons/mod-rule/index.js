const {RichEmbed} = require("discord.js");

const RULES = {
    1: ["message.badWords.delete", "message.badWords.warn", "user.name.badWords.change"],
    2: ["message.invite.delete", "message.invite.warn", "user.name.invite.kick"],
    3: ["message.spam.text.delete", "message.spam.mentions.delete", "message.spam.text.warn", "message.spam.mentions.warn"]
};

module.exports = PMTbot => {
    
    const isRuleGroupActive = (guild, id) => {
        const modRuleManager = PMTbot.exports.get("modrule.manager");
        const rules = RULES[id];
        for (const rule of rules) {
            if (!modRuleManager.hasRuleActive(guild, rule.split(".").slice(0, -1).join("."), rule.split(".").slice(-1)[0])) return false;
        }
        return true;
    };

    PMTbot.addCommand("modrule", {
        category: "Configuration Commands",
        description: "Toggle on or off certain rules for the bot to follow while moderating.",
        alias: ["mod-rule", "mr"]
    }, async message => {

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

        if (message.deletable) await message.delete();

        const getSelection = PMTbot.exports.get("utils.getSelection");
        const modRuleManager = PMTbot.exports.get("modrule.manager");

        const ruleIDtoSet = await getSelection({
            embed: new RichEmbed()
                .setTitle("Mod Rules")
                .setColor(0xff8800),
            channel: message.channel,
            user: message.author
        }, [
            {
                display: `${isRuleGroupActive(message.guild, 1) ? "**Disable**" : "**Enable**"} censoring bad words`,
                id: 1
            },
            {
                display: `${isRuleGroupActive(message.guild, 2) ? "**Disable**" : "**Enable**"} removing ads`,
                id: 2
            },
            {
                display: `${isRuleGroupActive(message.guild, 3) ? "**Disable**" : "**Enable**"} prevention of spam`,
                id: 3
            }
        ]);
        if (!ruleIDtoSet) return;
        const rules = RULES[ruleIDtoSet];
        const isActive = isRuleGroupActive(message.guild, ruleIDtoSet);
        if (isActive) {
            for (const rule of rules) await modRuleManager.setRule(message.guild, rule.split(".").slice(0, -1).join("."), rule.split(".").slice(-1)[0], false);
        } else {
            for (const rule of rules) await modRuleManager.setRule(message.guild, rule.split(".").slice(0, -1).join("."), rule.split(".").slice(-1)[0], true);
        }

        try {
            await message.channel.send(
                new RichEmbed()
                .setDescription(`${isActive ? "Disabled" : "Enabled"} mod rules!`)
                .setColor(0x00ff00)
            );
        } catch (error) {}

    });
};