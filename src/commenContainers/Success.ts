import { Colors, Component, ContainerBuilder, EmbedBuilder, SectionBuilder, TextDisplayBuilder } from "discord.js";

export function buildSuccessContainer(str: string) {
    let container = new ContainerBuilder().addSectionComponents(
        section => section
            .addTextDisplayComponents(
                textDisplay => textDisplay.setContent(str)
            )
            .setThumbnailAccessory(
                thumbnail => thumbnail
                    .setDescription("AttoviaBot looks happy")
                    .setURL("https://i.imgur.com/dfxVMP4.png")
            )
    )
    .setAccentColor(0xc57bf3)
    return container;
}