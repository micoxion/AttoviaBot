import { Colors, Component, ContainerBuilder, EmbedBuilder, SectionBuilder, TextDisplayBuilder } from "discord.js";
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { ABPictures } = require('../../config.json')

export function buildErrorContainer(str: string, info: string | undefined = undefined) {
    let container = new ContainerBuilder().addSectionComponents(
        section => section
            .addTextDisplayComponents(
                textDisplay => textDisplay.setContent(str)
            )
            .setThumbnailAccessory(
                thumbnail => thumbnail
                    .setDescription("AttoviaBot looks sad")
                    .setURL(ABPictures.sad)
            )
    )
    .setAccentColor(Colors.Red)
    if (info) {
        container.addSeparatorComponents(
        seperator => seperator
            .setDivider(true)
        ).addTextDisplayComponents(
            textDisplay => textDisplay.setContent("You can copy and paste the following for additional info:\n```"+info+"```")
        )
    }
    return container;
}