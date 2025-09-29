import { SlashCommandBuilder, EmbedBuilder, ChatInputCommandInteraction, } from 'discord.js';
import { getPromptByDay } from '../../database/postgres/prompts.js'

export let data = new SlashCommandBuilder()
        .setName("prompt")
        .setDescription("Get a prompt for the specified day!")
        .addNumberOption(option => 
            option.setName("day")
                .setDescription("The day you would like to know the prompt of.")
                .setRequired(true)
        )

export async function execute(interaction: ChatInputCommandInteraction) {
    let day = interaction.options.getNumber('day');
    let prompt = await getPromptByDay(day || 1)
    let embed = new EmbedBuilder()
        .setColor(0xc57bf3)
        .setTitle("Build Together Day " + day?.toString())
        .setAuthor({ name: 'AttoviaBot', iconURL: interaction.client.user.displayAvatarURL() })
        .setDescription("> " + prompt.prompt + "\n" + prompt.source + "\n### Date\n" + "<t:" + Math.floor(prompt.date.getTime() / 1000).toString() + ":D>")
        .setFields(
            { name: "Original Message", value: prompt.originalMessage }
        )
    await interaction.reply({embeds: [embed]})
}

// module.exports = {
//     data: new SlashCommandBuilder()
//         .setName("prompt")
//         .setDescription("Get a prompt for the specified day!")
//         .addNumberOption(option => 
//             option.setName("day")
//                 .setDescription("The day you would like to know the prompt of.")
//                 .setRequired(true)
//         ),
//     async execute(interaction: ChatInputCommandInteraction) {
//         let day = interaction.options.getNumber('day');
//         let prompt = await getPromptByDay(day || 1)
//         let embed = new EmbedBuilder()
//             .setColor(0xc57bf3)
//             .setTitle("Build Together Day " + day?.toString())
//             .setAuthor({ name: 'AttoviaBot', iconURL: interaction.client.user.displayAvatarURL() })
//             .setDescription("> " + prompt.prompt + "\n" + prompt.source + "\n### Date\n" + "<t:" + Math.floor(prompt.date.getTime() / 1000).toString() + ":D>")
//             .setFields(
//                 { name: "Original Message", value: prompt.originalMessage }
//             )
//         await interaction.reply({embeds: [embed]})
//     }
// }