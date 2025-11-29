import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { getGobberById } from "../../database/postgres/gobber.js";
import { Gobber } from "../../Gobber/Gobber.js";

export let data = new SlashCommandBuilder()
    .setName("mine")
    .setDescription("Set your Gobber to work!")

export async function execute(interaction: ChatInputCommandInteraction) {
    let gobberEntry = await getGobberById(interaction.user.id)
    let gobber: Gobber = new Gobber(interaction.user.id, null, null);
    if (gobberEntry) {
        gobber = Gobber.fromExisting(gobber)
    }
    else {
        await gobber.onboardGobber(interaction)
        return;
    }
    await gobber.startMining()
}