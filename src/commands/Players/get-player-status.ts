import { ChatInputCommandInteraction, ContainerBuilder, MessageFlags, messageLink, SlashCommandBuilder } from "discord.js";
import { Player } from "../../Player/Player.js";
import { getPlayerById } from "../../database/postgres/players.js";
import { buildMistakeContainer } from "../../commenContainers/Mistake.js";
import { MyschemaPlayers } from "kysely-codegen";

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
    let playerSchema = await getPlayerById(user.id) as MyschemaPlayers
    let player = Player.fromExisting(playerSchema)
    if (!player) {
        let container = buildMistakeContainer("That user doesn't have a player stored in the database yet! Its likely they haven't sent any messages since the release of that feature :(")
        await interaction.reply({components: [container], flags: MessageFlags.IsComponentsV2})
        return;
    }
    let container = player.getStatusContainer(user.avatarURL() || "")
    await interaction.reply({components: [container], flags: MessageFlags.IsComponentsV2})
}