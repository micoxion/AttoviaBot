import { Colors, Component, ContainerBuilder, EmbedBuilder, SectionBuilder, TextDisplayBuilder } from "discord.js";

import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { ABPictures } = require('../../config.json')

export function buildSuccessContainer(str: string) {
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
    .setAccentColor(0xc57bf3)
    return container;
}