const { SlashCommandBuilder, EmbedBuilder } = require('discord.js')
const { getWriterByUserId } = require('../../database/writers.js')

module.exports = {
    data: new SlashCommandBuilder()
        .setName("status")
        .setDescription("Get your wordcount and streak status")
        .addUserOption(option => 
            option.setName('writer')
                .setDescription("Writer to get the status of.")
        ),
    async execute(interaction) {
        let writerOption = interaction.options.getUser('writer');
        if (writerOption == null) {
            writerOption = interaction.user
        }
        let writer = await getWriterByUserId(writerOption.id, writerOption.username)
        let writeTime = "N/A"
        if (writer.lastTimeWrote) {
            writeTime = "<t:" + Math.floor(writer.lastTimeWrote.getTime() / 1000).toString() + ">"
        }
        let embed = new EmbedBuilder()
            .setColor(0xc57bf3)
            .setTitle(writerOption.username + '\'s Stats')
            .setAuthor({ name: 'AttoviaBot', iconURL: interaction.client.user.displayAvatarURL()})
            .setThumbnail(writerOption.displayAvatarURL())
            .addFields(
                { name: 'Word count', value: writer.wordCount.toString() },
                //{ name: '\u200B', value: '\u200B' },
                { name: 'Current Streak: ', value: writer.streak.toString() },
                { name: "Longest Streak: ", value: writer.longestStreak.toString() || "0" },
                { name: "Last time you wrote: ", value: writeTime}
            )
        console.log(writer, " ", writerOption.id)
        await interaction.reply({embeds: [embed]})
        //await interaction.reply("You are currently on a " + writer.streak + " day streak and have written " + writer.wordCount + " words in the Attovia discord!")
    }
}