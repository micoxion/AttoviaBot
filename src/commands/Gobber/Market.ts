import { ActionRow, ButtonBuilder, ButtonStyle, ChatInputCommandInteraction, ContainerBuilder, Events, Interaction, MessageFlags, SlashCommandBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } from "discord.js";
import { getGobberById } from "../../database/postgres/gobber.js";
import { Gobber } from "../../Gobber/Gobber.js";
import { ClipOperator, ClipPrice, OreInfo } from "../../Gobber/GobberData.js";
import { createRequire } from 'node:module';
import { EventEmitterCleanup } from "../../utilities/interactionCleanup.js";
import { ResourceType } from "../../Gobber/GobberTypes/Resources.js";
import { buildMistakeContainer } from "../../commenContainers/Mistake.js";
import { buildErrorContainer } from "../../commenContainers/Error.js";
const require = createRequire(import.meta.url);
const { GobberThumbs, GobberAccent } = require('../../../config.json');

const buttonSuffixes = [
    "1",
    "5",
    "25",
    "100",
    "Max"
]

let userOreSelection: Map<string, ResourceType> = new Map<string, ResourceType>();
let userAmountSelection: Map<string, number> = new Map<string, number>();


function buildMarketContainer(oreSelect: StringSelectMenuBuilder, addButtons: boolean = false, selling: boolean = true, notifText: string = ""): ContainerBuilder {
    let result = new ContainerBuilder().addSectionComponents(
        section => section
            .addTextDisplayComponents(
                textDisplay => textDisplay.setContent("'Oy there, welcome to Boris' ore market." +
                    "I 'ave some spiders to tend to soon, lets get this over with.\n" + notifText)
            )
            .setThumbnailAccessory(
                thumbnail => thumbnail
                    .setDescription("Borris' wry smile")
                    .setURL(GobberThumbs.Borris)
            )
    )
    .setAccentColor(parseInt(GobberAccent))
    .addActionRowComponents(
        actionRow => actionRow
            .addComponents(oreSelect)
    )

    if (!addButtons) {
        return result;
    }
    let sellButtons: ButtonBuilder[] = []
    for (let i = 0; i < buttonSuffixes.length; i++) {
        sellButtons[i] = new ButtonBuilder()
            .setCustomId("sell:" + buttonSuffixes[i])
            .setLabel("Sell " + buttonSuffixes[i])
            .setStyle(ButtonStyle.Success);
    }
    let buyButtons: ButtonBuilder[] = []
    for (let i = 0; i < buttonSuffixes.length; i++) {
        buyButtons[i] = new ButtonBuilder()
            .setCustomId("buy:" + buttonSuffixes[i])
            .setLabel("Buy " + buttonSuffixes[i])
            .setStyle(ButtonStyle.Success);
    }
    result.addActionRowComponents(
        actionRow => actionRow.addComponents(...sellButtons),
        actionRow => actionRow.addComponents(...buyButtons)
    );
    // if (notifText) {
    //     result.addTextDisplayComponents(
    //         textComponent => textComponent.setContent(notifText)
    //     );
    // }
    return result;
}

export let data = new SlashCommandBuilder()
    .setName("market")
    .setDescription("Sell and buy ore (at a markup) for Clips.")

export async function execute(interaction: ChatInputCommandInteraction) {
    let gobberEntry = await getGobberById(interaction.user.id)
    let gobber: Gobber //= new Gobber(interaction.user.id, null, null);
    if (gobberEntry) {
        gobber = Gobber.fromExisting(gobberEntry)
    } else {
        gobber = new Gobber(interaction.user.id, null, null);
        await gobber.onboardGobber(interaction)
        return;
    }
    let unlockedOre: OreInfo[] = gobber.getUnlockedOre();
    let oreSelect: StringSelectMenuBuilder = new StringSelectMenuBuilder()
        .setCustomId('ore-select')
        .setPlaceholder('Select an ore to buy or sell!');
    let oreOptions: StringSelectMenuOptionBuilder[] = [];
    let oreOptionsText: string = "";
    for (let i = 0; i < unlockedOre.length; i++) {
        let oreInfo = unlockedOre[i];
        oreOptions[oreOptions.length] = new StringSelectMenuOptionBuilder()
            .setLabel(oreInfo.emojiId + oreInfo.name)
            .setValue(oreInfo.name);
        oreOptionsText += `- ${oreInfo.emojiId}${oreInfo.name}: (Sell) ${oreInfo.value} / (Buy) ${ClipOperator.multiply(1.3, oreInfo.value)}`
    }
    oreSelect.addOptions(...oreOptions);
    let container = buildMarketContainer(oreSelect)

    let response = await interaction.reply({components: [container], flags: MessageFlags.IsComponentsV2});
    let optionsEmitter = interaction.client.on(Events.InteractionCreate, async (interaction: Interaction) => {
        if (interaction.isStringSelectMenu() && interaction.customId === "ore-select") {
            let selectedType: ResourceType = ResourceType.copper;
            if (interaction.values[0] === "Iron Ore") {
                selectedType = ResourceType.iron;
            } else if (interaction.values[0] === "Gold Ore") {
                selectedType = ResourceType.gold;
            }
            userOreSelection.set(interaction.user.id, selectedType);
        } else if (interaction.isStringSelectMenu() && interaction.customId === "amount-select") {
            userAmountSelection.set(interaction.user.id, parseInt(interaction.values[0]));
        } else if (!interaction.isButton()) {
            return;
        }
        await interaction.deferReply();
        let selectedResourceType = userOreSelection.get(interaction.user.id) || ResourceType.copper
        let selectedOre = gobber.gobberData.ore.get(selectedResourceType);
        //let selectedAmount = userAmountSelection.get(interaction.user.id) || 1;
        if (!selectedOre) {
            //send error container here
            let errorContainer = buildErrorContainer("Uh oh, something went wrong!", `${selectedResourceType} | ${gobber.gobberData.ore.keys.length}`);
            await response.edit({ components: [errorContainer], flags: MessageFlags.IsComponentsV2 });
            return;
        }
        let newNotifContainer: ContainerBuilder = new ContainerBuilder();
        /*if (interaction.customId === "sell-ore") {
            // if (selectedAmount > selectedOre.owned) {
            //     selectedAmount = selectedOre.owned;
            // }
            //let sellClipPrice = selectedOre.value.multiply(selectedAmount);
            //let sellClipPrice = ClipOperator.multiply(selectedAmount, selectedOre.value);
            //await gobber.addClips(sellClipPrice);
            newNotifContainer = buildMarketContainer(oreSelect, true, true)// `\`-# ${selectedAmount} ${selectedOre} sold for ${sellClipPrice}. New balance: ${gobber.gobberData.currency}\``);
        } else if (interaction.customId === "buy-ore") {
            // let totalPrice: ClipPrice = ClipOperator.multiply(selectedAmount, selectedOre.value);
            // let result: ClipPrice | null = await ClipOperator.purchase(gobber, totalPrice);
            // let notifText = `-# ${selectedAmount} ${selectedOre} bought for ${totalPrice}. New balance ${gobber.gobberData.currency}`;
            // if (result) {
            //     notifText = `\`\`\`diff\n-# You are missing the following for that purchase: ${result}\n\`\`\``;
            // }
            newNotifContainer = buildMarketContainer(oreSelect, true, false)// notifText);
        } else */if (interaction.customId.startsWith("sell:")) {
            let amount = parseInt(interaction.customId.substring(5))
            let sellClipPrice = ClipOperator.multiply(amount, selectedOre.value);

            await gobber.addClips(sellClipPrice);
            newNotifContainer = buildMarketContainer(oreSelect, true, true, `\n${amount} ${selectedOre.name} sold for ${ClipOperator.toString(sellClipPrice)}. New balance: ${ClipOperator.toString(gobber.gobberData.currency)}`)
        } else if (interaction.customId.startsWith("buy:")) {
            let amount = parseInt(interaction.customId.substring(4))
            //console.log(`Amount: ${amount}, Selected ore val: ${selectedOre.value}`)
            let totalPrice: ClipPrice = ClipOperator.multiply(amount, selectedOre.value);
            let result: ClipPrice | null = await ClipOperator.purchase(gobber, totalPrice);
            let notifText = `\n${amount} ${selectedOre.name} bought for ${ClipOperator.toString(totalPrice)}. New balance ${ClipOperator.toString(gobber.gobberData.currency)}`;
            if (result) {
                //console.log("Result: " + result.shards)
                notifText = `\`\`\`diff\nYou are missing the following for that purchase:\`\`\` ${ClipOperator.toString(result)}\n`;
            }
            newNotifContainer = buildMarketContainer(oreSelect, true, false, notifText);
        }
        else {
            newNotifContainer = buildMarketContainer(oreSelect, true, true);
        }
        await response.edit({components: [newNotifContainer], flags: MessageFlags.IsComponentsV2});
        await interaction.deleteReply();
    });
    await EventEmitterCleanup(optionsEmitter, interaction, 100000);
}