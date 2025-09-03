//pulled from this stackoverflow: https://stackoverflow.com/questions/63322284/discord-js-get-an-array-of-all-messages-in-a-channel
exports.fetchAllMessages = async function fetchAllMessages(channel) {
    let messages = []
    let message = await channel.messages
    .fetch({ limit: 1 })
    .then(messagePage => (messagePage.size === 1 ? messagePage.at(0) : null));
    //console.log(message)
    messages.push(message)

    while (message) {
        await channel.messages
        .fetch({ limit: 100, before: message.id })
        .then(messagePage => {
            messagePage.forEach(msg => messages.push(msg));

            // Update our message pointer to be the last message on the page of messages
            message = 0 < messagePage.size ? messagePage.at(messagePage.size - 1) : null;
        });
    }
    return messages
}