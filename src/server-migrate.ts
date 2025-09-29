import { escapeLiteral } from 'pg';
import pool from './database/database.js'
import { getAllPrompts } from './database/prompts.js';
import { addPrompt } from './database/prompts.js';
import { getAllWriters, getWriterByUserId, updateWordCount } from './database/writers.js';
import { getAllMessagesCounted } from './database/messagesCounted.js';
import { recordMessageTracked } from './database/postgres/messagesCounted.js';
import { ChannelType, Client, GatewayIntentBits, managerToFetchingStrategyOptions, Message, TextChannel } from 'discord.js';
//import { guildId } from '../config.json'

async function insertWithPool() {
    const client = await pool.connect();
    try {
        const res = await client.query("INSERT INTO public.\"Writers\" (userid, username, streak, longeststreak, wordcount) VALUES ('331634391790911488', 'siroxion', 0, 0, 0)")
        console.log(res)
    } finally {
        client.release();
    }
}

async function selectWithPool() {
    const client = await pool.connect();
    try {
        const res = await client.query("SELECT * FROM public.\"Writers\"")
        console.log(res)
    } finally {
        client.release();
    }
}

async function dropAllWithPool() {
    const client = await pool.connect()
    try {
        const res = await client.query("DELETE FROM public.\"Writers\"")
        console.log(res)
    } finally {
        client.release();
    }
}

//dropAllWithPool()

//selectWithPool()

// updateWordCount("527633223681966107", 20000, "predwinthegr8").then((newWordCount) => {
//     console.log(newWordCount)
// })

getAllWriters().then(async (writers) => {
    console.log(writers)
    const client = await pool.connect();
    let sql = "INSERT INTO public.\"Writers\" (userid, username, streak, longeststreak, wordcount, lasttimewrote) VALUES "
    for (let i = 0; i < writers.length; i++) {
        const writer = writers[i]
        sql += "('"
        sql += writer.userId + "', '"
        sql += writer.username + "', "
        sql += writer.streak + ", "
        sql += writer.longestStreak + ", "
        sql += writer.wordCount + ", "
        if (writer.lastTimeWrote) {
            sql += "'" + writer.lastTimeWrote.toISOString().slice(0, 19).replace('T', ' ') + "'"
        } else {
            sql += "NULL"
        }
        sql += ")"
        if (i == writers.length - 1) {
            sql += ";"
        } else {
            sql += ","
        }
    }
    console.log(sql)
    try {
        const res = await client.query(sql);
        console.log(res);
    } finally {
        client.release()
    }
});

// getAllPrompts().then(async (prompts) => {
//     console.log(prompts)
//     const client = await pool.connect();
//     let sql = "INSERT INTO public.\"Prompts\" (day, prompt, date, source, \"originalmessage\") VALUES"
//     for (let i = 0; i < prompts.length; i++) {
//         const prompt = prompts[i]
//         if (prompt.day == 84) {
//             console.log(prompt.date.toISOString())
//             console.log(prompt.date.toISOString().slice(0, 19))
//             console.log(prompt.date.toISOString().slice(0, 19).replace('T', ' '))
//         }
//         sql += "("
//         sql += prompt.day + ", "
//         sql += escapeLiteral(prompt.prompt) + ", '"
//         sql += prompt.date.toISOString().slice(0, 19).replace('T', ' ') + "', "
//         sql += escapeLiteral(prompt.source) + ", "
//         sql += escapeLiteral(prompt.originalMessage) + ")"
//         if (i == prompts.length - 1) {
//             sql += ";"
//         } else {
//             sql += ",\n"
//         }
//     }
//     console.log(sql)
//     try {
//         const res = await client.query(sql);
//         console.log(res);
//     } finally {
//         client.release();
//     }
// })

// const client = new Client({ 
//     intents: [ 
//         GatewayIntentBits.Guilds,  
//         GatewayIntentBits.GuildMessages,  
//         GatewayIntentBits.MessageContent] 
//     }); 
// client.login(process.env.DISCORD_TOKEN); 
// //client.once('clientReady', async () => {
// (async () => {
//     let guild = await client.guilds.fetch(guildId)
//     await guild.channels.fetch();
//     const textChannels = guild.channels.cache.filter(
//         channel => channel.type == ChannelType.GuildText
//     )
//     let channel = await guild.channels.fetch("1336424749361926174")
//     if (channel != null){
//         channel = channel as TextChannel
//     } else {
//         return;
//     }
//     if (!guild) {
//         throw("GUILD NOT FOUND")
//     }
//     getAllMessagesCounted().then(async (messages) => {
//         //console.log("HELLO: ", channels)
//         //let i = 0
//         // for await (const message of messages) {
//         //     //console.log(message)
//         //     let id = message.messageId
//         //     channel.messages.fetch(id).then((message) => {
//         //         console.log(message);
//         //     })
//         //     .catch(err => err)
//         //     textChannels.forEach(async (channel, name) => {
//         //         //console.log(channel)
//         //         if (channel as TextChannel && channel && (channel as TextChannel).messages) {
//         //             channel = channel as TextChannel
//         //             //console.log(channel.name, id);
//         //             //let message: Message = await 
//         //             channel.messages.fetch(id).then((message) => {
//         //                 console.log(message);
//         //             })
//         //             .catch(err => err)
//         //             // console.log(message)
//         //             // if (message.content !== undefined) {
//         //             //     console.log(message);
//         //             //     await recordMessageTracked(id, message.author.id, message.author.username)
//         //             // }
//         //         }
//         //     })
//         // }
//         for await (const message of messages) {
//             await recordMessageTracked(message.messageId)
//         }
//     })
// })()
//})