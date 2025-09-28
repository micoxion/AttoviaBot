import { ChatInputCommandInteraction, Options, SlashCommandStringOption } from "discord.js";

import { SlashCommandBuilder } from 'discord.js';
import { updateWordCount, updateStreak } from "../../database/postgres/writers";
import { hasMessageBeenCounted, recordMessageTracked } from "../../database/postgres/messagesCounted";

module.exports = {
    data: new SlashCommandBuilder()
        .setName("countwords")
        .setDescription("Counts the words of the supplied message link")
        .addStringOption((option: SlashCommandStringOption) => 
            option.setName('message-link')
                .setDescription("The discord message link of the message you wish to count the words in.")
                .setRequired(true)
        ),
    async execute(interaction: ChatInputCommandInteraction) {
        const messageLink = interaction.options.getString('message-link');
        const channel = interaction.channel
        const messageSplit = messageLink?.substring(10).split("/");
        if (messageSplit == null) {
            return;
        }
        const messageId = messageSplit[messageSplit.length - 1]
        let fetchedMessage = await channel?.messages.fetch(messageId)
        if (fetchedMessage == undefined) {
            await interaction.reply("Something went wrong and that message could not be found!");
            return;
        }
        let wordCount = fetchedMessage.content.split(" ").length
        //message.reply("That's " + charCount + " characters! And " + wordCount + " words!")
        //console.log(interaction.user.id, " ", fetchedMessage.author.id)
        let alreadyCounted = await hasMessageBeenCounted(fetchedMessage.id)
        if (interaction.user.id == fetchedMessage.author.id && !alreadyCounted) {
            await recordMessageTracked(fetchedMessage.id, fetchedMessage.author.id, fetchedMessage.author.username)
            let newWordCount = await updateWordCount(interaction.user.id, wordCount, interaction.user.username)
            let messageAddition = await updateStreak(interaction.user.id, interaction.user.username, fetchedMessage)
            await fetchedMessage.react("✅")
            await interaction.reply(wordCount + " words added to your total! Your new wordcount is: " + newWordCount + messageAddition)       
        }
        else if (interaction.user.id != fetchedMessage.author.id) {
            await interaction.reply("Hey that's not your message! Please only request counts of your own writing :)")
        } 
        else {
            await interaction.reply("Looks like that message's content has already been counted!")
        }
    }
}