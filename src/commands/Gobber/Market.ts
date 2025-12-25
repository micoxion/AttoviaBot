import { ChatInputCommandInteraction, ContainerBuilder, SlashCommandBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } from "discord.js";
import { getGobberById } from "../../database/postgres/gobber.js";
import { Gobber } from "../../Gobber/Gobber.js";
import { OreInfo } from "../../Gobber/GobberData.js";
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { GobberThumbs, GobberAccent } = require('../../../config.json');

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
    let oreSelect: StringSelectMenuBuilder = new StringSelectMenuBuilder()
        .setCustomId('ore-select')
        .setPlaceholder('Select an ore to buy or sell!')
    let oreOptions: StringSelectMenuOptionBuilder[] = []
    let oreOptionsText: string = ""
    for (const oreInfo of unlockedOre) {
        oreOptions[oreOptions.length] = new StringSelectMenuOptionBuilder()
            .setLabel(oreInfo.emojiId + oreInfo.name)
            .setValue(oreInfo.name)
        oreOptionsText += `- ${oreInfo.emojiId}${oreInfo.name} `
    }
    oreSelect.addOptions(...oreOptions);
    let container = new ContainerBuilder().addSectionComponents(
        section => section
            .addTextDisplayComponents(
                textDisplay => textDisplay.setContent("'Oy there, welcome to Boris' ore market." +
                    "I 'ave some spiders to tend to soon, lets get this over with.\n")
            )
            .setThumbnailAccessory(
                thumbnail => thumbnail
                    .setDescription("Borris' wry smile")
                    .setURL(GobberThumbs.Borris)
            )
    )
    .setAccentColor(parseInt(GobberAccent))
}