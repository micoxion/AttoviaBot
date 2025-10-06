import { Colors, Component, ContainerBuilder, EmbedBuilder, SectionBuilder, TextDisplayBuilder } from "discord.js";

export function buildMistakeContainer(str: string) {
    let container = new ContainerBuilder().addSectionComponents(
        section => section
            .addTextDisplayComponents(
                textDisplay => textDisplay.setContent(str)
            )
            .setThumbnailAccessory(
                thumbnail => thumbnail
                    .setDescription("AttoviaBot looks confused")
                    .setURL("https://i.imgur.com/nfxhMpf.png")
            )
    )
    .setAccentColor(Colors.Yellow)
    return container;
}