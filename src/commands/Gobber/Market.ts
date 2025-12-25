import { ChatInputCommandInteraction, ContainerBuilder, SlashCommandBuilder } from "discord.js";
import { getGobberById } from "../../database/postgres/gobber.js";
import { Gobber } from "../../Gobber/Gobber";
import { OreInfo } from "../../Gobber/GobberData.js";

export let data = new SlashCommandBuilder()
    .setName("market")
    .setDescription("Sell and buy ore (at a markup) for Clips.")

export async function execute(interaction: ChatInputCommandInteraction) {
    let gobberEntry = await getGobberById(interaction.user.id)
    let gobber: Gobber //= new Gobber(interaction.user.id, null, null);
    if (gobberEntry) {
        gobber = Gobber.fromExisting(gobberEntry)
    }
    else {
        gobber = new Gobber(interaction.user.id, null, null);
        await gobber.onboardGobber(interaction)
        return;
    }
    
    let unlockedOre: OreInfo[] = gobber.getUnlockedOre();
    
}