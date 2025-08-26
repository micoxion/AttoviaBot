// Import required modules 
const fs = require('node:fs')
const path = require('node:path')
const { Client, Collection, Events, GatewayIntentBits, MessageFlags } = require('discord.js'); 
const { getAllWriters, addWriter, updateWordCount } = require('./database/writers.js');
const { hasMessageBeenCounted, recordMessageTracked } = require('./database/messagesCounted.js');
const { channel } = require('node:diagnostics_channel');

//const { App } = require("./api/index.js")

//const { token } = require('./config.json')
require('dotenv').config(); 



/*App.listen(4000, ()=> {
    console.log("Running port 4000...")
})*/
getAllWriters().then((allWriters) => {
    console.log("All writers: ", allWriters)
})
.catch((e) => {
    console.log(e)
})

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

    console.log(interaction);
})

// Listen and respond to messages 
client.on('messageCreate', async message => { 

  // Ignore messages from bots 
  if (message.author.bot) return; 

  // Respond to a specific message 
  if (message.content.toLowerCase() === 'hello attoviabot') { 
    message.reply('Hi there! 👋 I am your friendly bot.'); 
  } 

//   if (message.content.startsWith("!ab count ")) {
//     const messageSplit = message.content.substring(10).split("/");
//     const messageId = messageSplit[messageSplit.length - 1]
//     const channel = message.channel
//     let fetchedMessage = await channel.messages.fetch(messageId)
//     let charCount = fetchedMessage.content.length
//     let wordCount = fetchedMessage.content.split(" ").length
//     //message.reply("That's " + charCount + " characters! And " + wordCount + " words!")
//     console.log(message.author.id, " ", fetchedMessage.author.id)
//     let alreadyCounted = await hasMessageBeenCounted(fetchedMessage.id)
//     if (message.author.id == fetchedMessage.author.id && !alreadyCounted) {
//         await recordMessageTracked(fetchedMessage.id)
//         let newWordCount = await updateWordCount(message.author.id, wordCount)
//         message.reply(wordCount + " words added to your total! Your new wordcount is: " + newWordCount)       
//     }
//     else if (message.author.id != fetchedMessage.author.id) {
//         message.reply("Hey that's not your message! Please only request counts of your own writing :)")
//     } 
//     else {
//         message.reply("Looks like that message's content has already been counted!")
//     }
//   }

  if (message.content.startsWith("!ab add ")) {
    const userId = message.content.substring(8)
    client.users.fetch(userId)
    .then(fetchedUser => {
        fetchedUser;
        let writer = {}
        writer.userId = userId
        writer.username = fetchedUser.username
        writer.streak = 0
        writer.wordCount = 0
        writer.lastTimeWrote = Math.floor(new Date().getTime() / 1000)
        addWriter(writer).then(() => {
            message.reply("Writer added succesfully!")
        })
    .catch(console.error)
    })
    .catch(console.error)
  }
});   



// Log in to Discord using token from .env 
client.login(process.env.DISCORD_TOKEN); 