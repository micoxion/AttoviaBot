// Import required modules 
import { createWorker } from 'tesseract.js';
import { dirname } from 'path';
import { fileURLToPath } from 'node:url';
import { config } from 'dotenv';
import { getRandomPrompt } from './database/postgres/prompts.js';
import fs from 'node:fs';
import path from 'node:path';
import url from 'url'
import { Client, Collection, Events, GatewayIntentBits, MessageFlags, ChannelType, EmbedBuilder, Interaction, TextChannel, SectionBuilder, ActivityType, ContainerBuilder } from 'discord.js'; 
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
import { buildErrorContainer } from './commenContainers/Error.js';
import { buildMistakeContainer } from './commenContainers/Mistake.js';
import { buildSuccessContainer } from './commenContainers/Success.js';
import { handleForumPost } from './eventHandlers/handleForumPosts.js';
import { welcomeMember } from './eventHandlers/welcomeMember.js';
import { addXpToOnePlayer as addXpToOnePlayer, xpHandler } from './xpHandler.js';
import { Player } from './Player/Player.js';
import { getPlayerById, insertPlayer } from './database/postgres/players.js';
import { MyschemaPlayers } from 'kysely-codegen';
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
require('dotenv').config(); 
const Players: Map<string, Player> = new Map()
const ActivePlayers: Map<Player, number> = new Map()
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
  setInterval(() => {
    //console.log("Resetting Active Players!")
    //xpHandler(client, ActivePlayers.keys())
    ActivePlayers.clear()
  }, 60000) //60000 milliseconds is 1 minute
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

async function updateActivity(discordId: string, username: string) {
  //console.log("Updating player activity: ", discordId, " | ", username)
  const StoredPlayer = Players.get(discordId)
  if (StoredPlayer && ActivePlayers.has(StoredPlayer)) {
    return;
  }
  if (StoredPlayer) {    
    addXpToOnePlayer(client, StoredPlayer)
    ActivePlayers.set(StoredPlayer, 1)
    return;
  } else {
    let playerSchema: MyschemaPlayers | undefined = await getPlayerById(discordId)
    if (!playerSchema) {
      let newPlayer = new Player(discordId, username)
      insertPlayer(newPlayer)
      ActivePlayers.set(newPlayer, 1)
      Players.set(discordId, newPlayer)
      return;
    }
    let player = Player.fromExisting(playerSchema)
    ActivePlayers.set(player, 1)
    Players.set(discordId, player)
    addXpToOnePlayer(client, player)
    return;  
  }  
}

client.on('threadCreate', handleForumPost)

client.on('guildMemberAdd', welcomeMember)

// Listen and respond to messages 
client.on('messageCreate', async (message: Message) => { 
  if ((!client.user || message.author.id != client.user.id) && message.author.bot != true) {
    await updateActivity(message.author.id, message.author.username)
  }
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

  if (message.content.startsWith("!ab test") && message.author.username == "siroxion") {
    let component = buildErrorContainer("Uh oh! Something went wrong!", "Test info.")
    message.reply({
      components: [component],
      flags: MessageFlags.IsComponentsV2
    })
  } 

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