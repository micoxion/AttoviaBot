const { countWords } = require('../utility/word-counter.js')
const { updateWordCount, updateStreak } = require('../database/writers.js');
const { hasMessageBeenCounted, recordMessageTracked } = require('../database/messagesCounted.js')
const { logToFile } = require('../utility/logger.js');

exports.countMessageWords = async function(message) {
    logToFile("Attempting to count words in message");
    if (!message.reference) {
        await message.reply("Please make sure to reply to a message you wrote that you wish to count the words in!");
        return;
    }
    let fetchedMessage = await message.fetchReference();
    if (fetchedMessage.author.id != message.author.id) {
        await message.reply("You didn't write that message! Please only count words in messages you have written :)");
        return;
    }
    let alreadyCounted = await hasMessageBeenCounted(fetchedMessage.id)
    if (alreadyCounted) {
        await message.reply("Looks like you've already counted the words for that message!");
        return;
    }
    let wordCount = countWords(fetchedMessage.content)
    await recordMessageTracked(fetchedMessage.id)
    let newWordCount = await updateWordCount(message.author.id, wordCount, message.author.username)
    let messageAddition = await updateStreak(message.author.id, fetchedMessage)
    await fetchedMessage.react("✅")
    await message.reply(wordCount + " words added to your total! Your new wordcount is: " + newWordCount + messageAddition)
    logToFile("Counted words in message: " + fetchedMessage.id)
    return;
}