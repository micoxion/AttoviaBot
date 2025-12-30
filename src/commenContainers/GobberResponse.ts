import { ContainerBuilder, TextDisplayBuilder } from "discord.js";
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { GobberAccent, ABPictures } = require('../../config.json')

export function buildGobberResponse(str: string): ContainerBuilder {
    let container = new ContainerBuilder().addSectionComponents(
        section => section
            .addTextDisplayComponents(
                textDisplay => textDisplay.setContent(str)
            )
            .setThumbnailAccessory(
                thumbnail => thumbnail
                    .setDescription("AttoviaBot looks happy")
                    .setURL(ABPictures.happy)
            )
    )
    .setAccentColor(parseInt(GobberAccent));
    return container;
}