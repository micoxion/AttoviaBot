import { Colors, Component, ContainerBuilder, EmbedBuilder, SectionBuilder, TextDisplayBuilder } from "discord.js";

export function buildErrorContainer(str: string, info: string | undefined = undefined) {
    let container = new ContainerBuilder().addSectionComponents(
        section => section
            .addTextDisplayComponents(
                textDisplay => textDisplay.setContent(str)
            )
            .setThumbnailAccessory(
                thumbnail => thumbnail
                    .setDescription("AttoviaBot looks sad")
                    .setURL("https://i.imgur.com/B1SBDZe.png")
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