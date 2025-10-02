// Import required modules 
import { createWorker } from 'tesseract.js';
import { dirname } from 'path';
import { fileURLToPath } from 'node:url';
import { config } from 'dotenv';
import { getRandomPrompt } from './database/postgres/prompts.js';
import fs from 'node:fs';
import path from 'node:path';
import url from 'url'
import { Client, Collection, Events, GatewayIntentBits, MessageFlags, ChannelType, EmbedBuilder, Interaction, TextChannel, SectionBuilder, ActivityType } from 'discord.js'; 
import { handleDailyPromptMessage } from './messageListeners/daily-prompt.js';
import { countAttachmentWords, countRepliedMessageWords } from './textCommands/count-words.js';
//import { initialize } from './textCommands/initialize.js';
//import { initializePrompts } from './textCommands/initializePrompts.js';
import { Message, ThreadChannel } from 'discord.js';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { BTForumId, SWForumId, dailyPromptChannelId, welcomeChannelId, BTTags, SWTags, siroxionId } = require('../config.json')// with { type: 'json' }
//import Module from 'node:module';
import { CustomCommand } from './ABTypes/CustomCommand.js';

import { updateWordCount, updateStreak } from './database/postgres/writers.js';
import { countWords } from './utilities/word-counter.js';
import { logToFile } from './utilities/logger.js';
import { recordMessageTracked } from './database/postgres/messagesCounted.js';
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
require('dotenv').config(); 



/*App.listen(4000, ()=> {
    console.log("Running port 4000...")
})*/
// getAllWriters().then((allWriters) => {
//     console.log("All writers: ", allWriters)
// })
// .catch((e) => {
//     console.log(e)
// })

// Create a new Discord client with message intent 
const client = new Client({ 
    intents: [ 
        GatewayIntentBits.Guilds,  
        GatewayIntentBits.GuildMessages,  
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers] 
    }); 

let commands: Collection<string, CustomCommand> = new Collection();

const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath)

console.log(commandFolders)
for (let i = 0; i < commandFolders.length; i++) {
    let folder = commandFolders[i]
    const commandsPath = path.join(foldersPath, folder);
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
    console.log(commandFiles)
    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const fileURL = url.pathToFileURL(filePath)
        console.log(filePath)
        //const command = require(filePath)
        import(fileURL.href)
          .then((command) => {
            // Set a new item in the Collection with the key as the command name and the value as the exported module
            if ('data' in command && 'execute' in command) {
                commands.set(command.data.name, command);
            } else {
                console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
            }
          })
    }
}
// Bot is ready 
client.once('clientReady', () => { 
  console.log(`🤖 Logged in as ${client.user?.tag}`); 
  client.user?.setPresence({
    activities: [{
      name: '/server-info',
      type: ActivityType.Watching
    }],
    status: 'online'
  })
}); 

client.on(Events.InteractionCreate, async (interaction: Interaction) => {
  if (!interaction.isChatInputCommand()) return;
  console.log(commands.toJSON())
  const command = commands.get(interaction.commandName);

  if (!command) {
    console.error(`No command matching ${interaction.commandName} was found.`);
    return;
  }

  try {
      await command.execute(interaction);
  } catch (error) {
    console.error(error);
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({ content: 'There was an error while executing this command!', flags: MessageFlags.Ephemeral });
    } else {
      await interaction.reply({ content: 'There was an error while executing this command!', flags: MessageFlags.Ephemeral });
    }
  }

  //console.log(interaction);
});

async function trackWords(thread: ThreadChannel, message: Message, wordCountToAdd: number) {
  let newWordCount = await updateWordCount(message.author.id, wordCountToAdd, message.author.username)
  logToFile("Updated word count for " + message.author.username)
  //await recordMessageTracked(message.id, message.author.id, message.author.username)
  await recordMessageTracked(message.id)
  logToFile("Message successfully tracked")
  await message.react("✅");
  logToFile(`${message.author.username} : ${message.author.id} | ${thread.name}\n
          Message ID: ${message.id} | Wordcount = ${wordCountToAdd}
              \n${message.content}`)
  let reply = await updateStreak(message.author.id, message.author.username, message)
  let embed = new EmbedBuilder()
        .setColor(0xc57bf3)
        .setTitle(message.author.username + '\'s words counted.')
        .setDescription(wordCountToAdd + " words added to your total! Your new wordcount is: " + newWordCount + reply)
  await thread.send({embeds: [embed]})//wordCountToAdd + " words added to your total! Your new wordcount is: " + newWordCount + reply)
}

client.on('threadCreate', async (thread: ThreadChannel)  => {
  if (!thread.parent || thread.parent.type != ChannelType.GuildForum) {
    return;
  }
  if (thread.parent.id === BTForumId && !thread.appliedTags.includes(BTTags.PromptSuggestion) && !thread.appliedTags.includes(BTTags.MetaDiscussion)) {
    //must wait to ensure the forum post's starter message is properly available in the API
    await new Promise(resolve => setTimeout(resolve, 2000))
    let message = await thread.fetchStarterMessage().catch((reason) => {console.log(reason)}) //messages.values().toArray()[0];
    let maxRetry = 10
    let tries = 0
    while (message == null && tries < maxRetry) {
      await new Promise(resolve => setTimeout(resolve, 500))
      message = await thread.fetchStarterMessage().catch((reason) => {console.log(reason)})
      tries++;
    }
    if (message == null) {
      await thread.send("Could not retrieve starter message of thread, please manually count the message. Sorry ;-;")
      return;
    }
    const attachments = message.attachments
    console.log("Attachments: ", attachments)
    if (attachments.size >= 1 && thread.appliedTags.includes(BTTags.Screenshot)) {
      let wordCountTotal = 0
      for (const [id, attachment] of attachments) {
        console.log("Attachment: ", attachment)
        logToFile("An image was posted by " + message.author.username);
        //await thread.send("We are working on supporting images with tessaract soon but for now a manual word count command is in the works!");
        const worker = await createWorker('eng');
        console.log("Attachment url: " + attachment.url)
        const ret = await worker.recognize(attachment.url);
        logToFile("Tesseract read attachment as: " + ret.data.text);
        wordCountTotal += countWords(ret.data.text);
      }
      logToFile("Tracking build Together image post: " + thread.name + " | Message: " + message.id);
      trackWords(thread, message, wordCountTotal)
      return
    } else if (message.content == undefined || message.content == "") {
      await thread.send("I saw no words to count, if you supplied a screenshot with some writing make sure you use the Screenshot tag!");
      return
    }
    let wordCount = countWords(message.content)
    logToFile("Tracking created Build Together post: " + thread.name + " | Message: " + message.id)
    trackWords(thread, message, wordCount)
  }
  if (thread.parent.id === SWForumId && !thread.appliedTags.includes(SWTags.MetaDiscussion)) {
    await new Promise(resolve => setTimeout(resolve, 1000))
    let message = await thread.fetchStarterMessage().catch((reason) => {console.log(reason)}) //messages.values().toArray()[0];
    let maxRetry = 10
    let tries = 0
    while (message == null && tries < maxRetry) {
      await new Promise(resolve => setTimeout(resolve, 500))
      message = await thread.fetchStarterMessage().catch((reason) => {console.log(reason)})
      tries++;
    }
    if (message == null) {
      await thread.send("Could not retrieve starter message of thread, please manually count the message. Sorry ;-;")
      return;
    }
    const attachments = message.attachments
    console.log("Attachments: ", attachments)
    if (attachments.size >= 1 && thread.appliedTags.includes(SWTags.Screenshot)) {
      let wordCountTotal = 0
      for (const [id, attachment] of attachments) {
        console.log("Attachment: ", attachment)
        logToFile("An image was posted by " + message.author.username);
        //await thread.send("We are working on supporting images with tessaract soon but for now a manual word count command is in the works!");
        const worker = await createWorker('eng');
        console.log("Attachment url: " + attachment.url)
        const ret = await worker.recognize(attachment.url);
        logToFile("Tesseract read attachment as: " + ret.data.text);
        wordCountTotal += countWords(ret.data.text);
      }
      logToFile("Tracking build Together image post: " + thread.name + " | Message: " + message.id);
      trackWords(thread, message, wordCountTotal)
      return
    } else if (message.content == undefined || message.content == "") {
      let embed = new EmbedBuilder().setDescription("I saw no words to count, if you supplied a screenshot with some writing make sure you use the Screenshot tag!");
      await thread.send({embeds: [embed]})
      return
    }
    
    let wordCount = countWords(message.content)
    logToFile("Tracking created Share Writing post: " + thread.name + " | Message: " + message.id)
    trackWords(thread, message, wordCount)
  }
});

client.on('guildMemberAdd', async (member) => {
  logToFile("PERSON JOINING GUILD: " + member.toString())
  const welcomeChannel = member.guild.channels.cache.get(welcomeChannelId) as TextChannel
  // const textDisplay = new TextDisplayBuilder()
  //   .setContent("Hello <@"+member.id+">! Someone will be along shortly to welcome you properly, in the meantime feel free to get the lay of the land with my /server-info command!");
  //   const thumbnail = new ThumbnailBuilder()
  //     .setURL(client.user?.avatarURL() || "")
  const section = new SectionBuilder()
    .addTextDisplayComponents(
      textDisplay => textDisplay
        .setContent("Hello <@"+member.id+">! Someone will be along shortly to welcome you properly, in the meantime feel free to get the lay of the land with my /server-info command!")
    )
    .setThumbnailAccessory(
      thumbnail => thumbnail
        .setDescription("Cute profile pic of AttoviaBot smiling")
        .setURL(client.user?.avatarURL() || "")
    )
  if (welcomeChannel) {
    await welcomeChannel.send({components: [section], flags: MessageFlags.IsComponentsV2})
  }
})

// Listen and respond to messages 
client.on('messageCreate', async (message: Message) => { 

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

  // if (message.content.startsWith("!ab init") && message.author.id == siroxionId) {
  //   await initialize(client)
  // }

  // if (message.content.startsWith("!ab prompts init") && message.author.id == siroxionId) {
  //   await initializePrompts(client)
  // }

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

});   



// Log in to Discord using token from .env 
client.login(process.env.DISCORD_TOKEN); 