const { SlashCommandBuilder } = require('discord.js')
const { updateWordCount } = require("../../database/writers.js")
const { hasMessageBeenCounted, recordMessageTracked } = require("../../database/messagesCounted.js")

module.exports = {
    data: new SlashCommandBuilder()
        .setName("countwords")
        .setDescription("Counts the words of the supplied message link")
        .addStringOption(option => 
            option.setName('message-link')
                .setDescription("The discord message link of the message you wish to count the words in.")
                .setRequired(true)
        ),
    async execute(interaction) {
        const messageLink = interaction.options.getString('message-link');
        const channel = interaction.channel
        const messageSplit = messageLink.substring(10).split("/");
        const messageId = messageSplit[messageSplit.length - 1]
        let fetchedMessage = await channel.messages.fetch(messageId)
        let wordCount = fetchedMessage.content.split(" ").length
        //message.reply("That's " + charCount + " characters! And " + wordCount + " words!")
        console.log(interaction.user.id, " ", fetchedMessage.author.id)
        let alreadyCounted = await hasMessageBeenCounted(fetchedMessage.id)
        if (interaction.user.id == fetchedMessage.author.id && !alreadyCounted) {
            await recordMessageTracked(fetchedMessage.id)
            let newWordCount = await updateWordCount(interaction.user.id, wordCount, interaction.user.username)
            await fetchedMessage.react("✅")
            await interaction.reply(wordCount + " words added to your total! Your new wordcount is: " + newWordCount)       
        }
        else if (interaction.user.id != fetchedMessage.author.id) {
            await interaction.reply("Hey that's not your message! Please only request counts of your own writing :)")
        } 
        else {
            await interaction.reply("Looks like that message's content has already been counted!")
        }
    }
}