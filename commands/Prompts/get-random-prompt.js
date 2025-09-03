const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { getRandomPrompt } = require("../../database/prompts");


module.exports = {
    data: new SlashCommandBuilder()
        .setName("random-prompt")
        .setDescription("Get a random Build Together prompt!"),
    async execute(interaction) {
        let prompt = await getRandomPrompt();
        let embed = new EmbedBuilder()
            .setColor(0xc57bf3)
            .setTitle("Here's your random prompt!")
            .setAuthor({ name: 'AttoviaBot', iconURL: interaction.client.user.displayAvatarURL() })
            .setDescription("# Build Together Day " + prompt.day.toString() + "\n> " + prompt.prompt + "\n" + prompt.source + "\n### Date\n" + "<t:" + Math.floor(prompt.date.getTime() / 1000).toString() + ":D>")
            .setFields(
                { name: "Original Message", value: prompt.originalMessage }
            )
        await interaction.reply({embeds: [embed]})
    }
}