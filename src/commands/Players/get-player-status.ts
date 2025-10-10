import { ChatInputCommandInteraction, ContainerBuilder, MessageFlags, messageLink, SlashCommandBuilder } from "discord.js";
import { Player } from "../../Player/Player.js";
import { getPlayerById } from "../../database/postgres/players.js";
import { buildMistakeContainer } from "../../commenContainers/Mistake.js";

export let data = new SlashCommandBuilder()
    .setName("level")
    .setDescription("See a rundown of your player level in the server!")
    .addUserOption(option =>
        option.setName("user")
            .setDescription("If you want to see someone elses level put them here!")
            .setRequired(false)
    )

export async function execute(interaction: ChatInputCommandInteraction) {
    let user = interaction.options.getUser('user');
    if (!user) {
        user = interaction.user
    }
    let player = await getPlayerById(user.id) as Player
    if (!player) {
        let container = buildMistakeContainer("That user doesn't have a player stored in the database yet! Its likely they haven't sent any messages since the release of that feature :(")
        await interaction.reply({components: [container], flags: MessageFlags.IsComponentsV2})
        return;
    }
    let container = player.getStatusContainer()
    await interaction.reply({components: [container], flags: MessageFlags.IsComponentsV2})
}