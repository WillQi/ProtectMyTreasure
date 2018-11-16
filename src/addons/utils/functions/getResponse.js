module.exports = async (user, channel, ...messageOptions) => {
    let message;
    try {
        message = await channel.send.apply(channel, messageOptions);
    } catch (error) {
        return;
    }
    const response = (await channel.awaitMessages(m => m.author.id === user.id, {
        max: 1,
        time: 60000 * 5
    })).first();
    if (message.deletable) await message.delete();
    if (!response) return;
    if (response.deletable) await response.delete();
    return response.content;
};