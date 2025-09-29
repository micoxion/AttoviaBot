import { Message } from "discord.js";

import { countWords } from '../utilities/word-counter.js';
import { updateWordCount, updateStreak } from '../database/postgres/writers.js';
import { hasMessageBeenCounted, recordMessageTracked } from '../database/postgres/messagesCounted.js';
import { logToFile } from '../utilities/logger.js';
import { createWorker } from 'tesseract.js';
import { EmbedBuilder } from 'discord.js';

let countMessageWords = async function(message: Message) {
    let wordCount = countWords(message.content)
    await recordMessageTracked(message.id)
    let newWordCount = await updateWordCount(message.author.id, wordCount, message.author.username)
    let messageAddition = await updateStreak(message.author.id, message.author.username, message)
    let embed = new EmbedBuilder()
        .setColor(0xc57bf3)
        .setTitle(message.author.username + '\'s words counted.')
        .setDescription(wordCount + " words added to your total! Your new wordcount is: " + newWordCount + messageAddition)
    await message.react("✅")
    await message.reply({embeds: [embed]})//wordCount + " words added to your total! Your new wordcount is: " + newWordCount + messageAddition)
    logToFile("Counted words in message: " + message.id)
    return;
}

//export countMessageWords

export async function countRepliedMessageWords(message: Message) {
    logToFile("Attempting to count words in message");
    let embed = new EmbedBuilder()
        .setColor(0xc57bf3)
    if (!message.reference) {
        embed.setDescription("Please make sure to reply to a message you wrote that you wish to count the words in!")
        await message.reply({embeds: [embed]});
        return;
    }
    let fetchedMessage = await message.fetchReference();
    if (fetchedMessage.author.id != message.author.id) {
        embed.setDescription("You didn't write that message! Please only count words in messages you have written :)")
        await message.reply({embeds: [embed]});
        return;
    }
    let alreadyCounted = await hasMessageBeenCounted(fetchedMessage.id)
    if (alreadyCounted) {
        embed.setDescription("Looks like you've already counted the words for that message!")
        await message.reply({embeds: [embed]});
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

export async function countAttachmentWords(message: Message) {
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
        await fetchedMessage.react("✅");
        logToFile(`${message.author.username} : ${message.author.id}\n
                Message ID: ${message.id} | Wordcount = ${wordCountTotal}`)
        let reply = await updateStreak(message.author.id, message.author.username, fetchedMessage)
        let embed = new EmbedBuilder()
            .setColor(0xc57bf3)
            .setTitle(message.author.username + '\'s words counted.')
            .setDescription(wordCountTotal + " words added to your total! Your new wordcount is: " + newWordCount + reply)
        await message.reply({embeds: [embed]})//wordCountTotal + " words added to your total! Your new wordcount is: " + newWordCount + reply)
        return
    }
}