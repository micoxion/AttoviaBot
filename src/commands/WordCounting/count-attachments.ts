import { ChatInputCommandInteraction, EmbedBuilder, Options, SlashCommandStringOption } from "discord.js";

import { SlashCommandBuilder } from 'discord.js';
import { updateWordCount, updateStreak } from "../../database/postgres/writers.js";
import { hasMessageBeenCounted, recordMessageTracked } from "../../database/postgres/messagesCounted.js";
import { logToFile } from "../../utilities/logger.js";
import { createWorker } from "tesseract.js";
import { countWords } from "../../utilities/word-counter.js";

export let data = new SlashCommandBuilder()
        .setName("count-attachment-words")
        .setDescription("Counts the words in any attached images of the supplied message link.")
        .addStringOption((option: SlashCommandStringOption) => 
            option.setName('message-link')
                .setDescription("The discord message link of the message you wish to count the attachment words in.")
                .setRequired(true)
        )

export async function execute(interaction: ChatInputCommandInteraction) {
    const messageLink = interaction.options.getString('message-link');
    const channel = interaction.channel
    const messageSplit = messageLink?.substring(10).split("/");
    let embed = new EmbedBuilder()
        .setColor(0xc57bf3)
    if (messageSplit == null) {
        embed.setDescription("Uh oh! Something went wrong, feel free to ping <@331634391790911488> and let him know!")
        await interaction.reply({embeds: [embed]})
        return;
    }
    const messageId = messageSplit[messageSplit.length - 1]
    let fetchedMessage = await channel?.messages.fetch(messageId)
    if (fetchedMessage == undefined) {
        embed.setDescription("Something went wrong and that message could not be found!")
        await interaction.reply({embeds: [embed]});
        return;
    }
    let alreadyCounted = await hasMessageBeenCounted(fetchedMessage.id)
    if (alreadyCounted) {
        embed.setDescription("Looks like that message's content has already been counted!")
        await interaction.reply({embeds: [embed]})
        return;
    }
    if (interaction.user.id != fetchedMessage.author.id) {
        embed.setDescription("Hey that's not your message! Please only request counts of your own writing :)")
        await interaction.reply({embeds: [embed]})
    }
    logToFile("Attempting to count words in message attachments for message: " + fetchedMessage.url);
    const attachments = fetchedMessage.attachments
    if (attachments.size >= 1) {
        let wordCountTotal = 0
        for (const [id, attachment] of attachments) {
            console.log("Attachment: ", attachment)
            logToFile("An image was posted by " + fetchedMessage.author.username);
            //await thread.send("We are working on supporting images with tessaract soon but for now a manual word count command is in the works!");
            const worker = await createWorker('eng');
            console.log("Attachment url: " + attachment.url)
            const ret = await worker.recognize(attachment.url);
            logToFile("Tesseract read attachment as: " + ret.data.text);
            wordCountTotal += countWords(ret.data.text);
        }
        //logToFile("Tracking build Together image post: " + thread.name + " | Message: " + message.id);
        let newWordCount = await updateWordCount(fetchedMessage.author.id, wordCountTotal, fetchedMessage.author.username)
        logToFile("Updated word count for " + fetchedMessage.author.username)
        await recordMessageTracked(fetchedMessage.id)
        logToFile("Message successfully tracked")
        await fetchedMessage.react("✅");
        logToFile(`${fetchedMessage.author.username} : ${fetchedMessage.author.id}\n
                Message ID: ${fetchedMessage.id} | Wordcount = ${wordCountTotal}`)
        let reply = await updateStreak(fetchedMessage.author.id, fetchedMessage.author.username, fetchedMessage)
        embed.setTitle(fetchedMessage.author.username + '\'s words counted.')
            .setDescription(wordCountTotal + " words added to your total! Your new wordcount is: " + newWordCount + reply)
        await interaction.reply({embeds: [embed]})//wordCountTotal + " words added to your total! Your new wordcount is: " + newWordCount + reply)
        return
    }    
}