import { SlashCommandBuilder, EmbedBuilder, ChatInputCommandInteraction, SlashCommandUserOption } from 'discord.js'
import { getWriterByUserId } from '../../database/writers'

const tiers = [500, 1000, 5000, 10000, 20000, 30000, 40000, 50000, 75000, 100000, 150000, 200000 ]

const buildBook = function(totalCount: number, username: string): string {
    let tierIndex = -1
    for (let i = 0; i < tiers.length; i++) {
        if (totalCount <= tiers[i]) {
            break;
        }
        tierIndex = i
    }    
    if (tierIndex == -1) {
        return `
Your lore bible requires ${tiers[tierIndex + 1] - totalCount} more words to reach the first tier! Keep it up!\n
\`\`\`
        /\ ${username}
       /_/    __
    __/_____ |__|
\`\`\`
        `
    }
    let finalString = ""
    if (tierIndex < tiers.length - 1) {
        finalString += "Your lore bible is Tier " + (tierIndex + 1).toString() + "\n Words till next tier: " + (tiers[tierIndex + 1] - totalCount).toString()
    }
    else {
        finalString += "Your lore bible has reached the maximum tier of " + (tierIndex + 1).toString() + "!"
    }
    let layers = tierIndex + 2
    finalString += "\`\`\`\n"
    let bookCoverLength = 8
    if (username.length > bookCoverLength) {
        bookCoverLength = username.length
    }
    for (let layer = 1; layer <= layers; layer++) {
        let layerString = "";
        //build covers
        if (layer == 1) {
            layerString += " ";
            for (let piece = 1; piece <= bookCoverLength + 1; piece++) {
                layerString += "_"
            }
            layerString += "\n"
            finalString += layerString
            continue;
        }
        if (layer == 2) {
            let fillString = " "
            let appendString = "/"
            if (layers > 2) {
                layerString += "/"
                if (layers == 3) {
                    layerString += username
                    fillString = "";
                    if (layerString.length < bookCoverLength) {
                        for (let i = layerString.length; i <= bookCoverLength + 1; i++) {
                            layerString += " "
                        }                
                    }
                }
            } else {
                layerString += "("
                layerString += username
                if (layerString.length < bookCoverLength) {
                    for (let i = layerString.length; i <= bookCoverLength; i++) {
                        layerString += "_"
                    }                
                }
                fillString = ""
                appendString = "("
            }
            for (let coverPiece = 1; coverPiece <= bookCoverLength + 1; coverPiece++) {
                layerString += fillString;
            }
            layerString += appendString + "\n";
            finalString += layerString
            continue;
        }
        if (layers > 2 && layer == layers) {
            layerString += "\\";
            for (let coverPiece = 1; coverPiece <= bookCoverLength + 1; coverPiece++) {
                layerString += "_";
            }
            layerString += "\\";
            finalString += layerString
            continue;
        }
        if (layer == Math.floor(layers / 2) + 1) {
            layerString += "|" + username
            if (layerString.length < bookCoverLength) {
                for (let i = layerString.length; i <= bookCoverLength; i++) {
                    layerString += " "
                }                
            }
            layerString += "|\n"
            finalString += layerString
            continue;
        }
        layerString += "|"
        for (let i = 1; i <= bookCoverLength; i++) {
            layerString += " "
        }
        layerString += "|\n"
        finalString += layerString
    }
    finalString += "\`\`\`"
    return finalString
}

// const asciiArt = [
// ```
// \`\`\`
//  ________
// (________(
// \`\`\`
// ```,
// ```
// \`\`\`
//  ________
// /        /
// \________\
// \`\`\`
// ```
// ]

module.exports = {
    data: new SlashCommandBuilder()
        .setName("status")
        .setDescription("Get your wordcount and streak status")
        .addUserOption((option: SlashCommandUserOption) => 
            option.setName('writer')
                .setDescription("Writer to get the status of.")
        ),
    async execute(interaction: ChatInputCommandInteraction) {
        let writerOption = interaction.options.getUser('writer');
        if (writerOption == null) {
            writerOption = interaction.user
        }
        let writer = await getWriterByUserId(writerOption.id, writerOption.username)
        if (writer == null || writer == undefined) {
            await interaction.reply("Failed to find that writer in the database!");
            return;
        }
        let writeTime = "N/A"
        if (writer.lastTimeWrote) {
            writeTime = "<t:" + Math.floor(writer.lastTimeWrote.getTime() / 1000).toString() + ">"
        }
        let embed = new EmbedBuilder()
            .setColor(0xc57bf3)
            .setTitle(writerOption.username + '\'s Stats')
            .setAuthor({ name: 'AttoviaBot', iconURL: interaction.client.user.displayAvatarURL()})
            .setThumbnail(writerOption.displayAvatarURL())
            .addFields(
                //@ts-ignore
                { name: 'Word count', value: writer.wordCount.toString() },
                //{ name: '\u200B', value: '\u200B' },
                //@ts-ignore
                { name: 'Current Streak: ', value: writer.streak.toString() },
                //@ts-ignore
                { name: "Longest Streak: ", value: writer.longestStreak.toString() || "0" },
                { name: "Last time you wrote: ", value: writeTime},
                //@ts-ignore
                { name: "Lore bible: ", value: buildBook(writer.wordCount, writerOption.username)}
            )
        console.log(writer, " ", writerOption.id)
        await interaction.reply({embeds: [embed]})
        //await interaction.reply("You are currently on a " + writer.streak + " day streak and have written " + writer.wordCount + " words in the Attovia discord!")
    }
}