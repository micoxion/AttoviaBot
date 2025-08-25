const { SlashCommandBuilder } = require('discord.js')

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
        channel.messages.fetch(messageLink)
        .then(message => {
            console.log()
        })
        await interaction.reply('I shall count them');
    }
}