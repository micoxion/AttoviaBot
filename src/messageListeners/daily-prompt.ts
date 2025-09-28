import { Message } from "discord.js";

import { logToFile } from '../utilities/logger';
import { addPrompt } from '../database/postgres/prompts';

export async function handleDailyPromptMessage(message: Message) {
    logToFile("Adding new daily prompt!")
    let content = message.content;
    let dayMatch = content.match(/Day ([0-9]+)/)
    let day = 0
    if (dayMatch == null) {
        logToFile("Day not found!")
        return;
    }
    let messageLink = message.url
    day = parseInt(dayMatch[1])
    //day = day[0].match(/[0-9]+/g)[0]
    //console.log("\n", day)
    let promptTextMatch = content.match(/[^0-9][>].+/g)
    let promptText = ""
    if (promptTextMatch != null && promptTextMatch.length > 0) {
        promptText = promptTextMatch[0].trim().substring(1).trim()
        //promptText = promptText.trim()
    } else {
        promptText = ""
    }
    let sourceMatch = content.match(/From.+|from.+/g)
    let source = ""
    if (sourceMatch == null) {
        source = ""
    }
    else {
        source = sourceMatch[0]
    }
    let date = message.createdAt
    //console.log(message)
    logToFile("====> " + content + " | " + promptText + " : " + source + " : " + date + " : \nDAY: " + day)

    await addPrompt({
        day: day,
        prompt: promptText,
        date: date,
        source: source,
        originalMessage: messageLink
    })
    logToFile("Prompt saved!")
}