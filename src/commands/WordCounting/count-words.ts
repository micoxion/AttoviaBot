import { ChatInputCommandInteraction, EmbedBuilder, MessageFlags, Options, SlashCommandStringOption } from "discord.js";

import { SlashCommandBuilder } from 'discord.js';
import { updateWordCount, updateStreak } from "../../database/postgres/writers.js";
import { hasMessageBeenCounted, recordMessageTracked } from "../../database/postgres/messagesCounted.js";
import { buildErrorContainer } from "../../commenContainers/Error.js";
import { buildMistakeContainer } from "../../commenContainers/Mistake.js";
import { buildSuccessContainer } from "../../commenContainers/Success.js";

export let data = new SlashCommandBuilder()
        .setName("countwords")
        .setDescription("Counts the words of the supplied message link")
        .addStringOption((option: SlashCommandStringOption) => 
            option.setName('message-link')
                .setDescription("The discord message link of the message you wish to count the words in.")
                .setRequired(true)
        )

export async function execute(interaction: ChatInputCommandInteraction) {
    const messageLink = interaction.options.getString('message-link');
    const channel = interaction.channel
    const messageSplit = messageLink?.substring(10).split("/");
    let embed = new EmbedBuilder()
        .setColor(0xc57bf3)
    if (messageSplit == null) {
        let container = buildErrorContainer("Uh oh! Something went wrong, feel free to ping <@331634391790911488> and let him know!", "Message link: " + messageLink + "\n channel: " + channel?.toString())
        await interaction.reply({components: [container], flags: MessageFlags.IsComponentsV2})
        return;
    }
    const messageId = messageSplit[messageSplit.length - 1]
    let fetchedMessage = await channel?.messages.fetch(messageId)
    if (fetchedMessage == undefined) {
        let container = buildErrorContainer("Something went wrong and that message could not be found!", "Message link: " + messageLink + "\n Message id: " + messageId)
        await interaction.reply({components: [container], flags: MessageFlags.IsComponentsV2});
        return;
    }
    let wordCount = fetchedMessage.content.split(" ").length
    //message.reply("That's " + charCount + " characters! And " + wordCount + " words!")
    //console.log(interaction.user.id, " ", fetchedMessage.author.id)
    let alreadyCounted = await hasMessageBeenCounted(fetchedMessage.id)
    if (interaction.user.id == fetchedMessage.author.id && !alreadyCounted) {
        await recordMessageTracked(fetchedMessage.id)
        let newWordCount = await updateWordCount(interaction.user.id, wordCount, interaction.user.username)
        let messageAddition = await updateStreak(interaction.user.id, interaction.user.username, fetchedMessage)
        await fetchedMessage.react("✅")
        let container = buildSuccessContainer(wordCount + " words added to your total! Your new wordcount is: " + newWordCount + messageAddition)
        await interaction.reply({components: [container], flags: MessageFlags.IsComponentsV2});    
    }
    else if (interaction.user.id != fetchedMessage.author.id) {
        let container = buildMistakeContainer("Hey that's not your message! Please only request counts of your own writing :)")
        await interaction.reply({components: [container], flags: MessageFlags.IsComponentsV2});
        return;
    } 
    else {
        let container = buildMistakeContainer("Looks like that message's content has already been counted!")
        await interaction.reply({components: [container], flags: MessageFlags.IsComponentsV2});
        return;
    }
}

// module.exports = {
//     data: new SlashCommandBuilder()
//         .setName("countwords")
//         .setDescription("Counts the words of the supplied message link")
//         .addStringOption((option: SlashCommandStringOption) => 
//             option.setName('message-link')
//                 .setDescription("The discord message link of the message you wish to count the words in.")
//                 .setRequired(true)
//         ),
//     async execute(interaction: ChatInputCommandInteraction) {
//         const messageLink = interaction.options.getString('message-link');
//         const channel = interaction.channel
//         const messageSplit = messageLink?.substring(10).split("/");
//         if (messageSplit == null) {
//             return;
//         }
//         const messageId = messageSplit[messageSplit.length - 1]
//         let fetchedMessage = await channel?.messages.fetch(messageId)
//         if (fetchedMessage == undefined) {
//             await interaction.reply("Something went wrong and that message could not be found!");
//             return;
//         }
//         let wordCount = fetchedMessage.content.split(" ").length
//         //message.reply("That's " + charCount + " characters! And " + wordCount + " words!")
//         //console.log(interaction.user.id, " ", fetchedMessage.author.id)
//         let alreadyCounted = await hasMessageBeenCounted(fetchedMessage.id)
//         if (interaction.user.id == fetchedMessage.author.id && !alreadyCounted) {
//             await recordMessageTracked(fetchedMessage.id)
//             let newWordCount = await updateWordCount(interaction.user.id, wordCount, interaction.user.username)
//             let messageAddition = await updateStreak(interaction.user.id, interaction.user.username, fetchedMessage)
//             await fetchedMessage.react("✅")
//             await interaction.reply(wordCount + " words added to your total! Your new wordcount is: " + newWordCount + messageAddition)       
//         }
//         else if (interaction.user.id != fetchedMessage.author.id) {
//             await interaction.reply("Hey that's not your message! Please only request counts of your own writing :)")
//         } 
//         else {
//             await interaction.reply("Looks like that message's content has already been counted!")
//         }
//     }
// }