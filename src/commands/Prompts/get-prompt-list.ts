import { AttachmentBuilder, ChatInputCommandInteraction, FileBuilder, MessageFlags, SlashCommandBuilder } from "discord.js";
import { Prompt } from '../../ABTypes/Prompt.js';
import { getAllPrompts } from "../../database/postgres/prompts.js";
import { buildSuccessContainer } from "../../commenContainers/Success.js";
import fs from 'node:fs'
import path from 'node:path'
import { dirname } from 'path';
import { fileURLToPath } from 'node:url';
import { buildErrorContainer } from "../../commenContainers/Error.js";
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export let data = new SlashCommandBuilder()
    .setName("prompt-list")
    .setDescription("Get a text file dump of every Build Together prompt")
    .addBooleanOption(option =>
        option.setName("markdown-format")
            .setDescription("Should output use Markdown formatting? (default false)")
            .setRequired(false)  
    )

export async function execute(interaction: ChatInputCommandInteraction) {
    let prompts: Prompt[] = await getAllPrompts()
    let isMarkdown = interaction.options.getBoolean("markdown-format") || false
    let output: string = ""
    for (let i = 0; i < prompts.length; i++) {
        let prompt = prompts[i]
        if (isMarkdown) {
            output += "# "
        }
        output += `Build Together Day ${prompt.day}\n`
        if (isMarkdown) {
            output += "> "
        }
        output += `${prompt.prompt}\n${prompt.source}\nDate: ${prompt.date.toDateString()}\n`
        if (isMarkdown) {
            output += `[Original Message](${prompt.originalMessage})\n\n`
        } else {
            output += `Original Message: ${prompt.originalMessage}\n\n`
        }
    }
    let filePath = path.join(__dirname, 'BuildTogether.txt')
    fs.writeFile(filePath, output, async (err) => {
        if (err) {
            let container = buildErrorContainer("Uh oh, something went wrong producing your file!", err.message)
            await interaction.reply({components: [container]})
        } else {
            let container = buildSuccessContainer("Here's your Build Together prompt dump! If you see anything wrong or any prompts missing let <@331634391790911488> know!")
            let fileName: string = ""
            if (isMarkdown) {
                fileName = "BuildTogether.md"
            } else {
                fileName = "BuildTogether.txt"
            }
            let attachment = new AttachmentBuilder(Buffer.from(output), { name: fileName })
            container.addFileComponents(fileComponent => fileComponent
                .setURL(`attachment://${fileName}`)
            )
            await interaction.reply({components: [container], files: [attachment], flags: MessageFlags.IsComponentsV2})
        }
    })
}