import { ChatInputCommandInteraction, ContainerBuilder, MessageFlags, SlashCommandBuilder, TextInputComponent } from "discord.js";
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { ABPictures } = require('../../../config.json')

export let data = new SlashCommandBuilder()
    .setName("gobber-commands")
    .setDescription("Outputs a list of commands for the Gobber incremental.")

export async function execute(interaction: ChatInputCommandInteraction) {
    let container = new ContainerBuilder()
        .addSectionComponents(
            section => section
                .addTextDisplayComponents(
                    textComponent =>
                        textComponent.setContent("### Usable Commands\n" +
                            "**The Mine**\n" +
                            "- `/mine`: Starts and stops mining, you can only mine for 10 minutes at first, but this can be increased with infusions later.\n")
                )
                .setThumbnailAccessory(
                    thumbnail => thumbnail
                        .setDescription("AttoviaBot looks happy")
                        .setURL(ABPictures.happyChristmas)
                )
        )
        .addSeparatorComponents(seperator => 
            seperator.setDivider(true)
        )
        .addTextDisplayComponents(textComponent =>
            textComponent.setContent("### Planned Commands\n" +
                "**The Mine**\n" +
                "- `/gobber-help`: Gives a rundown of how the Gobber Incremental works.\n" +
                "- `/market`: Sell (or buy at a markup) ore here for Clips.\n" +
                "- `/infuse`: Open the infusion menu to upgrade your tools and gain bonuses that will improve mining.\n" +
                "- `/mine-upgrades`: Open the upgrades menu to upgrade the mine, increase depth (unlock new ores) and spread (allow multi-ore spawn per mining tick).\n" +
                "- `/prestige`: Opens the prestige menu, make sure to sell your ore before you prestige!\n" +
                "- `!ab sell all <ore>`: Shortcut to sell all of a given ore type, if no type is specified sells all of your ore.\n" + 
                "- `!ab buy <amount> <ore>`: Shortcut to purchase a specified amount of an ore type.\n" +
                "**The Forge**\n" +
                "Coming soon, these will be unlocked once you have enough God Stones to buy a forge."
            )
        )
        .setAccentColor(0x5e8f6b)
    await interaction.reply({components: [container], flags: MessageFlags.IsComponentsV2});
}