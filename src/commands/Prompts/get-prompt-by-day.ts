import { SlashCommandBuilder, EmbedBuilder, ChatInputCommandInteraction, ContainerBuilder, MessageFlags, ButtonBuilder, Events, Interaction, ButtonStyle, } from 'discord.js';
import { getPromptByDay } from '../../database/postgres/prompts.js'
import { buildSuccessContainer } from '../../commenContainers/Success.js';
import { Prompt } from '../../ABTypes/Prompt.js';
import { EventEmitterCleanup } from '../../utilities/interactionCleanup.js';

function buildPromptContainer(day: number, prompt: Prompt): ContainerBuilder {
    let result = buildSuccessContainer(`# Build Together Day ${day?.toString()}\n> ${prompt.prompt}\n${prompt.source}\n
### Date: <t:${Math.floor(prompt.date.getTime() / 1000).toString()}:D>\n### Original Message: ${prompt.originalMessage}`)
    result.addActionRowComponents(
        actionRowComponent => actionRowComponent
            .addComponents(
                new ButtonBuilder()
                    .setCustomId(`Prompt:${prompt.day - 1}`)
                    .setLabel(`⬅️ Day ${prompt.day - 1}`)
                    .setStyle(ButtonStyle.Secondary),
                new ButtonBuilder()
                    .setCustomId(`Prompt:${prompt.day + 1}`)
                    .setLabel(`Day ${prompt.day + 1} ➡️`)
                    .setStyle(ButtonStyle.Secondary)
            )
    )
    return result;
}

export let data = new SlashCommandBuilder()
        .setName("prompt")
        .setDescription("Get a prompt for the specified day!")
        .addNumberOption(option => 
            option.setName("day")
                .setDescription("The day you would like to know the prompt of.")
                .setRequired(true)
        )

export async function execute(interaction: ChatInputCommandInteraction) {
    let day = interaction.options.getNumber('day') || 1;
    let prompt = await getPromptByDay(day)
    let container = buildPromptContainer(day, prompt)
    let response = await interaction.reply({components: [container], flags: MessageFlags.IsComponentsV2})
    let buttonEmitter = interaction.client.on(Events.InteractionCreate, async (interaction: Interaction) => {
        if (!interaction.isButton()) return;
        if (!interaction.customId.startsWith("Prompt")) return;

        await interaction.deferReply({flags: MessageFlags.Ephemeral})

        let day = parseInt(interaction.customId.split(":")[1])

        prompt = await getPromptByDay(day)

        container = buildPromptContainer(day, prompt)

        await response.edit({components: [container], flags: MessageFlags.IsComponentsV2})
        await interaction.deleteReply();
    })

    await EventEmitterCleanup(buttonEmitter, interaction, 100000);
}