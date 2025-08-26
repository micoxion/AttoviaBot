// Import required modules 
const fs = require('node:fs')
const path = require('node:path')
const { Client, Collection, Events, GatewayIntentBits, MessageFlags, ThreadManager } = require('discord.js'); 
const { channel } = require('node:diagnostics_channel');
const { countMessageWords } = require('./textCommands/count-words.js')
const { intialize } = require('./textCommands/intialize.js')

//const { App } = require("./api/index.js")

//const { token } = require('./config.json')
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

    console.log(interaction);
})

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