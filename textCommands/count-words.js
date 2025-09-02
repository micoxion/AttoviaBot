const { countWords } = require('../utility/word-counter.js')
const { updateWordCount, updateStreak } = require('../database/writers.js');
const { hasMessageBeenCounted, recordMessageTracked } = require('../database/messagesCounted.js')
const { logToFile } = require('../utility/logger.js');
const { createWorker } = require('tesseract.js')

let countMessageWords = async function(message) {
    let wordCount = countWords(message.content)
    await recordMessageTracked(message.id)
    let newWordCount = await updateWordCount(message.author.id, wordCount, message.author.username)
    let messageAddition = await updateStreak(message.author.id, message)
    await message.react("✅")
    await message.reply(wordCount + " words added to your total! Your new wordcount is: " + newWordCount + messageAddition)
    logToFile("Counted words in message: " + message.id)
    return;
}

exports.countMessageWords = countMessageWords

exports.countRepliedMessageWords = async function(message) {
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
    await countMessageWords(fetchedMessage)
    // let wordCount = countWords(fetchedMessage.content)
    // await recordMessageTracked(fetchedMessage.id)
    // let newWordCount = await updateWordCount(message.author.id, wordCount, message.author.username)
    // let messageAddition = await updateStreak(message.author.id, fetchedMessage)
    // await fetchedMessage.react("✅")
    // await message.reply(wordCount + " words added to your total! Your new wordcount is: " + newWordCount + messageAddition)
    // logToFile("Counted words in message: " + fetchedMessage.id)
    // return;
}

exports.countAttachmentWords = async function(message) {
    logToFile("Attempting to count words in message attachments for message: " + message.id);    
    if (!message.reference) {
        await message.reply("Please make sure to reply to a message you wrote that you wish to count the words in!");
        return;
    }
    let fetchedMessage = await message.fetchReference();
    if (fetchedMessage.author.id != message.author.id) {
        await message.reply("You didn't write that message! Please only count words in messages you have written :)");
        return;
    }
    const attachments = fetchedMessage.attachments
    logToFile("Attachment count: " + attachments.size);
    if (attachments.size >= 1) {
        let wordCountTotal = 0
        for (const [id, attachment] of attachments) {
            console.log("Attachment: ", attachment)
            logToFile("An image was posted by " + message.author.username);
            //await thread.send("We are working on supporting images with tessaract soon but for now a manual word count command is in the works!");
            const worker = await createWorker('eng');
            console.log("Attachment url: " + attachment.url)
            const ret = await worker.recognize(attachment.url);
            logToFile("Tesseract read attachment as: " + ret.data.text);
            wordCountTotal += countWords(ret.data.text);
        }
        //logToFile("Tracking build Together image post: " + thread.name + " | Message: " + message.id);
        let newWordCount = await updateWordCount(message.author.id, wordCountTotal, message.author.username)
        logToFile("Updated word count for " + message.author.username)
        await recordMessageTracked(message.id)
        logToFile("Message successfully tracked")
        await message.react("✅");
        logToFile(`${message.author.username} : ${message.author.id}\n
                Message ID: ${message.id} | Wordcount = ${wordCountTotal}`)
        let reply = await updateStreak(message.author.id, message)
        await message.reply(wordCountTotal + " words added to your total! Your new wordcount is: " + newWordCount + reply)
        return
    }
}