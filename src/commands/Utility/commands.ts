import { SlashCommandBuilder, EmbedBuilder, ChatInputCommandInteraction, ContainerBuilder, MessageFlags } from 'discord.js'

export let data = new SlashCommandBuilder()
        .setName("commands")
        .setDescription("Outputs a list of commands and their uses")

export async function execute(interaction: ChatInputCommandInteraction) {
    let container = new ContainerBuilder()
        .addSectionComponents(
            section => section
                .addTextDisplayComponents(textComponent => 
                    textComponent.setContent("### Text Commands\n" +
                            "- `!ab count`: Counts the words of the message being replied to. You must be the author of the message being replied to\n" +
                            "- `!ab attachments`: Counts the words in the attachments of the message being replied to. You must be the author of the message being replied to\n")
                )
                .setThumbnailAccessory(
                    thumbnail => thumbnail
                        .setDescription("AttoviaBot looks happy")
                        .setURL("https://i.imgur.com/dfxVMP4.png")
                )
        )
        .addSeparatorComponents(seperator => 
                seperator.setDivider(true)
        ).addTextDisplayComponents(textComponent => 
            textComponent.setContent("### Slash Commands\n" +
                    "- `/commands`: You're lookin at it! :)\n" +
                    "- `/countwords`: Counts the words in the linked message. Requires a full message link as a parameter.\n" +
                    "- `/count-attachment-words`: Counts the words in the attachments on the linked message. Requires a full message link as a parameter.\n" +
                    "- `/status (user)`: Outputs an embed with the information of the user supplied or of the initial user of the command if no user parameter is supplied.\n" +
                    "- `/prompt (day)`: Get a random Build Together prompt for the day specified.\n" +
                    "- `/random-prompt`: Get a random Build Together prompt.")
        )
    await interaction.reply({components: [container], flags: MessageFlags.IsComponentsV2})
}