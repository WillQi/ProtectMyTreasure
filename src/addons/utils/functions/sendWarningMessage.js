const {RichEmbed} = require("discord.js");

module.exports = message => {
    let hasSentWarningMessage = false;
    const sendWarningMessage = async content => {
        if (hasSentWarningMessage) return;
        hasSentWarningMessage = true;
        try {
            await (await message.reply(
                new RichEmbed()
                .setDescription(content)
                .setColor(0xff0000)
            )).delete(10000);
        } catch (error) {}
    };

    return sendWarningMessage;

};