import { ContainerBuilder } from "discord.js";
import { OreInfo } from "../../../Gobber/GobberData";

function buildOreString(minedOre: Map<OreInfo, number>): string {
    let response = "";
    for (const [ore, amount] of minedOre) {
        response += `- ${ore.emojiId} ${ore.name}: ${amount}\n`;
    }
    return response;
}

export function BuildMineResultsContainer(startMessage: string, minedOre: Map<OreInfo, number>) {
    let container = new ContainerBuilder().addTextDisplayComponents(
        textDisplay => textDisplay
            .setContent(startMessage),
        textDisplay => textDisplay
            .setContent(buildOreString(minedOre))
    )
    .setAccentColor(0x5e8f6b)
    return container;
}