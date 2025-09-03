const { SlashCommandBuilder, EmbedBuilder } = require('discord.js')

module.exports = {
    data: new SlashCommandBuilder()
        .setName("commands")
        .setDescription("Outputs a list of commands and their uses"),
    async execute(interaction) {
        let embed = new EmbedBuilder()
            .setColor(0xc57bf3)
            .setTitle("AttoviaBot Commands")
            .setAuthor({ name: 'AttoviaBot', iconURL: interaction.client.user.displayAvatarURL() })
            .setDescription("### Text Commands\n" +
                            "- !ab count: Counts the words of the message being replied to. You must be the author of the message being replied to\n" +
                            "- !ab attachments: Counts the words in the attachments of the message being replied to. You must be the author of the message being replied to\n" +
                            "### Slash Commands\n" +
                            "- /commands: You're lookin at it! :)\n" +
                            "- /countwords: Counts the words in the linked message. Requires a full message link as a parameter.\n" +
                            "- /status (user): Outputs an embed with the information of the user supplied or of the initial user of the command if no user parameter is supplied.\n" +
                            "- /prompt (day): Get a random Build Together prompt for the day specified.\n" +
                            "- /random-prompt: Get a random Build Together prompt.")
        await interaction.reply({embeds: [embed]})
    }
}