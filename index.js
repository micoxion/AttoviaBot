// Import required modules 
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url)
import { createWorker } from 'tesseract.js';
import { dirname } from 'path';
import { fileURLToPath } from 'node:url';
const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, Events, GatewayIntentBits, MessageFlags, ThreadManager, ChannelType } = require('discord.js'); 
const { channel } = require('node:diagnostics_channel');
const { countMessageWords } = require('./textCommands/count-words.js')
const { intialize } = require('./textCommands/intialize.js')
const { BTForumId, SWForumId } = require('./config.json')

//const { App } = require("./api/index.js")

const { BTTags, SWTags } = require('./config.json');
const { updateWordCount, updateStreak } = require('./database/writers.js');
const { countWords } = require('./utility/word-counter.js');
const { logToFile } = require('./utility/logger.js');
const { recordMessageTracked } = require('./database/messagesCounted.js');
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
        GatewayIntentBits.MessageContent] 
    }); 
    
client.commands = new Collection();

const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath)

console.log(commandFolders)
for (let i = 0; i < commandFolders.length; i++) {
    let folder = commandFolders[i]
    const commandsPath = path.join(foldersPath, folder);
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath)
        // Set a new item in the Collection with the key as the command name and the value as the exported module
        if ('data' in command && 'execute' in command) {
            client.commands.set(command.data.name, command);
        } else {
            console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
        }
    }
}
// Bot is ready 
client.once('ready', () => { 
  console.log(`🤖 Logged in as ${client.user.tag}`); 
}); 

client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const command = interaction.client.commands.get(interaction.commandName);

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

client.on('threadCreate', async thread => {
  if (!thread.parent || thread.parent.type != ChannelType.GuildForum) {
    return;
  }
  if (thread.parent.id === BTForumId && !thread.appliedTags.includes(BTTags.PromptSuggestion) && !thread.appliedTags.includes(BTTags.MetaDiscussion)) {
    await new Promise(resolve => setTimeout(resolve, 1000))
    const message = await thread.fetchStarterMessage() //messages.values().toArray()[0];
    const attachments = message.attachments
    console.log("Attachments: ", attachments)
    if (attachments.size >= 1) {
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
      let newWordCount = await updateWordCount(message.author.id, wordCountTotal, message.author.username)
      logToFile("Updated word count for " + message.author.username)
      await recordMessageTracked(message.id)
      logToFile("Message successfully tracked")
      await message.react("✅");
      logToFile(`${message.author.username} : ${message.author.id} | ${thread.name}\n
              Message ID: ${message.id} | Wordcount = ${wordCountTotal}
                  \n${message.content}`)
      return
    }
    let wordCount = countWords(message.content)
    logToFile("Tracking created Build Together post: " + thread.name + " | Message: " + message.id)
    let newWordCount = await updateWordCount(message.author.id, wordCount, message.author.username)
    logToFile("Updated word count for " + message.author.username)
    await recordMessageTracked(message.id)
    logToFile("Message successfully tracked")
    await message.react("✅");
    logToFile(`${message.author.username} : ${message.author.id} | ${thread.name}\n
            Message ID: ${message.id} | Wordcount = ${wordCount}
                \n${message.content}`)
    let reply = await updateStreak(message.author.id, message)
    await thread.send(wordCount + " words added to your total! Your new wordcount is: " + newWordCount + reply)
  }
  if (thread.parent.id === SWForumId && !thread.appliedTags.includes(SWTags.MetaDiscussion)) {
    const messages = await thread.messages.fetch({limit: 100});
    if (messages.length < 1 && attachments.length >= 1) {
      logToFile("An image was posted by " + thread.author.username)
      await thread.send("We are working on supporting images with tessaract soon but for now a manual word count command is in the works!");
      return
    }
    let message = messages.at(-1);
    let wordCount = countWords(message.content)
    logToFile("Tracking created Share Writing post: " + thread.name + " | Message: " + message.id)
    let newWordCount = await updateWordCount(message.author.id, wordCount, message.author.username)
    logToFile("Updated word count for " + message.author.username)
    await recordMessageTracked(message.id)
    logToFile("Message successfully tracked")
    await message.react("✅");
    logToFile(`${message.author.username} : ${message.author.id} | ${thread.name}\n
            Message ID: ${message.id} | Wordcount = ${wordCount}
                \n${message.content}`)
    let reply = await updateStreak(message.author.id, message)
    thread.send(wordCount + " words added to your total! Your new wordcount is: " + newWordCount + reply)
  }
});

// Listen and respond to messages 
client.on('messageCreate', async message => { 

  // Ignore messages from bots 
  if (message.author.bot) return; 

  // Respond to a specific message 
  if (message.content.toLowerCase() === 'hello attoviabot') { 
    await message.reply('Hi there! 👋 I am your friendly bot.');
    return;
  } 

  if (message.content.startsWith("!ab count")) {
    await countMessageWords(message)
  }

  if (message.content.startsWith("!ab init")) {
    await intialize(client)
  }
});   



// Log in to Discord using token from .env 
client.login(process.env.DISCORD_TOKEN); 