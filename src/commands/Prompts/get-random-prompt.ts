import { ChatInputCommandInteraction, SlashCommandBuilder, EmbedBuilder, MessageFlags } from "discord.js";

import { getRandomPrompt } from "../../database/postgres/prompts.js";
import { buildSuccessContainer } from "../../commenContainers/Success.js";

export let data = new SlashCommandBuilder()
        .setName("random-prompt")
        .setDescription("Get a random Build Together prompt!")

export async function execute(interaction: ChatInputCommandInteraction) {
    let prompt = await getRandomPrompt();
    let container = buildSuccessContainer(`#Here's your random promt!\n# Build Together Day ${prompt.day?.toString()}\n> ${prompt.prompt}\n${prompt.source}\n
### Date: <t:${Math.floor(prompt.date.getTime() / 1000).toString()}:D>\n### Original Message: ${prompt.originalMessage}`)
        await interaction.reply({components: [container], flags: MessageFlags.IsComponentsV2})
}