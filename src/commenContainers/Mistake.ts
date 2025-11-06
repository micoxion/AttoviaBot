import { Colors, Component, ContainerBuilder, EmbedBuilder, SectionBuilder, TextDisplayBuilder } from "discord.js";
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { ABPictures } = require('../../config.json')


export function buildMistakeContainer(str: string) {
    let container = new ContainerBuilder().addSectionComponents(
        section => section
            .addTextDisplayComponents(
                textDisplay => textDisplay.setContent(str)
            )
            .setThumbnailAccessory(
                thumbnail => thumbnail
                    .setDescription("AttoviaBot looks confused")
                    .setURL(ABPictures.confusedChristmas)
            )
    )
    .setAccentColor(Colors.Yellow)
    return container;
}