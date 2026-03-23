import { Client, Message, MessageFlags } from "discord.js";
import { Gobber } from "../Gobber/Gobber.js";
import { buildGobberResponse } from "../commenContainers/GobberResponse.js";
import { ClipOperator, OreInfo } from "../Gobber/GobberData.js";
import { ResourceType } from "../Gobber/GobberTypes/Resources.js";

const youShouldOnboardmessage = "You don't have a gobber yet! Please use /mine to get onboarded and start mining!";

export async function gobberCommand(client: Client, message: Message, gobber: Gobber | null) {
    if (!gobber) {
        let container = buildGobberResponse(youShouldOnboardmessage);
        await message.reply({
            components: [container], 
            flags: MessageFlags.IsComponentsV2
        });
        return;
    }
    let container = gobber.getGobberContainer()
    await message.reply({
        components: [container], 
        flags: MessageFlags.IsComponentsV2
    });
    return;
}

//Example: !ab sell copper 21
export async function sell(client: Client, message: Message, gobber: Gobber | null) {
    if (!gobber) {
        let container = buildGobberResponse(youShouldOnboardmessage);
        await message.reply({
            components: [container], 
            flags: MessageFlags.IsComponentsV2
        });
        return;
    }
    let resultText: string
    let unlockedOre: OreInfo[] = gobber.getUnlockedOre();
    let selectedOre: OreInfo | null = null;
    let parameters: string[] = message.content.substring(9).split(' ')
    let amount = parseInt(parameters[1]);
    if (Number.isNaN(amount) && parameters[1] != "a") {
        let container = buildGobberResponse(`${parameters[1]} is not a number, please format your command like: \`!ab sell copper 21\`.`)
        await message.reply({
            components: [container],
            flags: MessageFlags.IsComponentsV2
        })
        return;
    }
    for (const oreInfo of unlockedOre) {
        let loweredOreName = oreInfo.name.toLowerCase()
        if (loweredOreName.startsWith(parameters[0].toLowerCase())) {
            selectedOre = oreInfo;
        }
    }
    if (!selectedOre) {
        let container = buildGobberResponse(`No ore type exists that starts with or is called ${parameters[0]}. Try !ab gobber to see info on the ores you have access to.`)
        await message.reply({
            components: [container],
            flags: MessageFlags.IsComponentsV2
        })
        return;
    } 
    if (selectedOre.owned <= 0) {
        let container = buildGobberResponse(`You have no ${selectedOre.name}! Go mine some first!`)
        await message.reply({
            components: [container],
            flags: MessageFlags.IsComponentsV2
        })
        return;
    }
    if (selectedOre.owned < amount || parameters[1] == "a") {
        amount = selectedOre.owned;
    }
    let sellClipPrice = ClipOperator.multiply(amount, selectedOre.value);
    await gobber.addClips(sellClipPrice);
    await gobber.removeOre(ResourceType.copper, amount)
    let container = buildGobberResponse(`${amount} ${selectedOre.name} sold for ${ClipOperator.toString(sellClipPrice)}. New balance: ${ClipOperator.toString(gobber.gobberData.currency)}`);
    await message.reply({
        components: [container],
        flags: MessageFlags.IsComponentsV2
    })
    return;
}