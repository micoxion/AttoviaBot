import { Client, Message, MessageFlags } from "discord.js";
import { buildSuccessContainer } from "../commenContainers/Success.js";
import { addToGoodBotCount, getGoodBotCount } from "../database/postgres/botStats.js";
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url)
const { CustomEmojiIds } = require('../../config.json')




export async function validateGoodBot(message: Message, client: Client) {
    let goodbotcount = await addToGoodBotCount(1)
    await message.react("<" + CustomEmojiIds.meydalove + ">")
    if (message.reference && goodbotcount) {
        let replyMessage = await message.fetchReference()
        if (replyMessage.author.id != client.user?.id) {
            return;
        }
        let numberSuffix = "th"
        if (goodbotcount.goodbotcount.toString().slice(-1) == "1" && goodbotcount.goodbotcount.toString().slice(-2) != "11") {
            numberSuffix = "st"
        }
        if (goodbotcount.goodbotcount.toString().slice(-1) == "2" && goodbotcount.goodbotcount.toString().slice(-2) != "12") {
            numberSuffix = "nd"
        }
        if (goodbotcount.goodbotcount.toString().slice(-1) == "3" && goodbotcount.goodbotcount.toString().slice(-2) != "13") {
            numberSuffix = "rd"
        }
        const container = buildSuccessContainer("Thanks <@" + message.author.id + ">! That's the " + goodbotcount?.goodbotcount + numberSuffix + " time I've been called a good bot in the server :)")
        await message.reply({components: [container], flags: MessageFlags.IsComponentsV2})
    }
}