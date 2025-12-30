import { Client, EmbedBuilder, Message, MessageFlags } from "discord.js";
import { countAttachmentWords, countRepliedMessageWords } from './count-words.js';
import { validateGoodBot } from '../messageListeners/validateGoodPrompt.js';
import { buildErrorContainer } from "../commenContainers/Error.js";
import { getRandomPrompt } from "../database/postgres/prompts.js";
import { handleDailyPromptMessage } from "../messageListeners/daily-prompt.js";
import { createRequire } from 'node:module';
import { getGobberById } from "../database/postgres/gobber.js";
import { Gobber } from "../Gobber/Gobber.js";
const require = createRequire(import.meta.url);
const { BTForumId, SWForumId, dailyPromptChannelId, welcomeChannelId, BTTags, SWTags, siroxionId } = require('../config.json')// with { type: 'json' }

async function retrieveGobber(client: Client, discordId: string): Promise<Gobber | null> {
  let gobberEntry = await getGobberById(discordId);
  let gobber: Gobber
  if (gobberEntry) {
    gobber = Gobber.fromExisting(gobberEntry)
  } else {
    return null
  }
  return gobber
}

export async function textCommandsHandler(client: Client, message: Message) {
  // Ignore messages from bots 
  if (message.author.bot) return; 

  // Respond to a specific message 
  if (message.content.toLowerCase() === 'hello attoviabot') { 
    await message.reply('Hi there! 👋 I am your friendly bot.');
    return;
  } 

  if (message.content.startsWith("!ab attachments")) {
    await countAttachmentWords(message)
  }

  if (message.content.startsWith("!ab count")) {
    await countRepliedMessageWords(message)
  }

  if (message.content.toLocaleLowerCase().match(/good bot|good attoviabot|good attovia bot/g)) {    
    await validateGoodBot(message, client)
  }

  // if (message.content.startsWith("!ab init") && message.author.id == siroxionId) {
  //   await initialize(client)
  // }

  // if (message.content.startsWith("!ab prompts init") && message.author.id == siroxionId) {
  //   await initializePrompts(client)
  // }

  if (message.content.startsWith("!ab test") && message.author.username == "siroxion") {
    let component = buildErrorContainer("Uh oh! Something went wrong!", "Test info.")
    message.reply({
      components: [component],
      flags: MessageFlags.IsComponentsV2
    })
  }
/**** GOBBER ****/
  if (message.content.startsWith("!ab sell")) {
    let gobber = retrieveGobber(client, message.author.id)
  }

  if (message.content.startsWith("!ab buy")) {

  }

  if (message.content.startsWith("!ab gobber")) {

  }
  
/**** PROMPTS ****/
  if (message.content.startsWith("!ab random prompt")) {
    let prompt = await getRandomPrompt()
    let embed = new EmbedBuilder()
            .setColor(0xc57bf3)
            .setTitle("Build Together Day " + prompt.day.toString())
            .setAuthor({ name: 'AttoviaBot', iconURL: client.user?.displayAvatarURL() })
            .setDescription("> " + prompt.prompt + "\n" + prompt.source + "\n### Date\n" + "<t:" + Math.floor(prompt.date.getTime() / 1000).toString() + ":D>")
            .setFields(
                { name: "Original Message", value: prompt.originalMessage }
            )
    await message.reply({embeds: [embed]})
  }

  if (message.channelId === dailyPromptChannelId) {
    await handleDailyPromptMessage(message)
  }
}