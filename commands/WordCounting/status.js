const { SlashCommandBuilder } = require('discord.js')
const { getWriterByUserId } = require('../../database/writers.js')

module.exports = {
    data: new SlashCommandBuilder()
        .setName("status")
        .setDescription("Get your wordcount and streak status"),
    async execute(interaction) {
        let writer = await getWriterByUserId(interaction.user.id)
        console.log(writer[0], " ", interaction.user.id)
        await interaction.reply("You are currently on a " + writer[0].streak + " day streak and have written " + writer[0].wordCount + " words in the Attovia discord!")
    }
}