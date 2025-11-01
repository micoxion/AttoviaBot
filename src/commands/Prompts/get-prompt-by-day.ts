import { SlashCommandBuilder, EmbedBuilder, ChatInputCommandInteraction, ContainerBuilder, MessageFlags, } from 'discord.js';
import { getPromptByDay } from '../../database/postgres/prompts.js'
import { buildSuccessContainer } from '../../commenContainers/Success.js';

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
    let container = buildSuccessContainer(`# Build Together Day ${day?.toString()}\n> ${prompt.prompt}\n${prompt.source}\n
### Date: <t:${Math.floor(prompt.date.getTime() / 1000).toString()}:D>\n### Original Message: ${prompt.originalMessage}`)
    await interaction.reply({components: [container], flags: MessageFlags.IsComponentsV2})
}