const { SlashCommandBuilder } = require('discord.js')
const { getWriterByUserId } = require('../../database/writers.js')

module.exports = {
    data: new SlashCommandBuilder()
        .setName("status")
        .setDescription("Get your wordcount and streak status"),
    async execute(interaction) {
        let writer = await getWriterByUserId(interaction.user.id, interaction.user.username)
        console.log(writer, " ", interaction.user.id)
        await interaction.reply("You are currently on a " + writer.streak + " day streak and have written " + writer.wordCount + " words in the Attovia discord!")
    }
}