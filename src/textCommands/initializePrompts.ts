import { Client, TextChannel } from "discord.js";

import { dailyPromptChannelId, guildId } from '../../config.json';
import { fetchAllMessages } from '../utilities/fetchAllMessages.js';
import { addPrompt } from '../database/prompts.js';

export async function initializePrompts(client: Client) {
    const guild = client.guilds.cache.get(guildId);
    if (guild == undefined) {
        throw("Could not find guild!")
    }
    const dailyPromptChannel = await guild.channels.fetch(dailyPromptChannelId) as TextChannel;
    let messages = await fetchAllMessages(dailyPromptChannel);
    for (const message of messages) {
        if (message == undefined || message == null) {
            continue;
        }
        let content = message.content;
        let dayMatch = content.match(/Day ([0-9]+)/)
        if (!dayMatch) {
            continue;
        }
        let messageLink = message.url
        let day = parseInt(dayMatch[1])
        //day = day[0].match(/[0-9]+/g)[0]
        //console.log("\n", day)
        let promptTextMatch = content.match(/[^0-9][>].+/g)
        let promptText = ""
        if (promptTextMatch != null && promptTextMatch.length > 0) {
            promptText = promptTextMatch[0].trim().substring(1).trim()
            //promptText = promptText.trim()
        }
        let sourceMatch = content.match(/From.+|from.+/g)
        let source = ""
        if (sourceMatch != null) {
            source = source[0]
        }
        let date = message.createdAt
        //console.log(message)
        console.log("====> ", content, " | ", promptText, " : ", source, " : ", date, " : \nDAY: ", day)

        await addPrompt({
            day: day,
            prompt: promptText,
            date: date,
            source: source,
            originalMessage: messageLink
        })
        
        //console.log(day)
    }
    //console.log(messages) 1364642570642395186 
}