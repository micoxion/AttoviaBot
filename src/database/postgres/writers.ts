import pool from '../database.js'
import dotenv from 'dotenv'
import { Writer } from '../../ABTypes/Writer.js'
import { Message } from 'discord.js';
import { logToFile } from '../../utilities/logger.js';
dotenv.config()

async function addWriter(writerData: Writer) {
    const sql = "INSERT INTO Writers (userid, username, streak, longeststreak, wordcount, lasttimewrote) " +
              "VALUES ($1, $2, $3, $4, $5, $6) RETURNING *";
    const values = [writerData.userid, writerData.username, writerData.streak || 0, writerData.longeststreak || 0, writerData.wordcount || 0, writerData.lasttimewrote || new Date(0)]
    const client = await pool.connect()
    try {
        const res = await client.query(sql, values)
        return res.rows[0]
    } finally {
        client.release();
    }
}

export async function getWriterByUserId(userId: string, username: string): Promise<Writer> {
    const sql = `SELECT * FROM Writers WHERE userid = '${userId}'`
    const client = await pool.connect()
    try {
        const res = await client.query(sql)
        if (res.rowCount == 0) {
            const writer = await addWriter({
                userid: userId, username: username,
                streak: 0,
                longeststreak: 0,
                wordcount: 0,
                lasttimewrote: null
            })
            return writer;
        } else {
            return res.rows[0]
        }
    } finally {
        client.release();
    }
}

export async function getAllWriters() {
    const sql = "SELECT * FROM Writers"
    const client = await pool.connect()
    try {
        const res = await client.query(sql)
        return res.rows
    } finally {
        client.release();
    }
}

async function updateColumns(userId: string, columnNames: string[], columns: any[]) {
    let columnString = ""
    for (let i = 0; i < columnNames.length; i++) {
        let str = columnNames[i]
        columnString += str + " = $" + (i + 1).toString()
        if (i < columnNames.length - 1) {
            columnString += ","
        }
    }
    let userIdIndex = columns.length + 1
    columns.push(userId)

    let sql = "UPDATE Writers SET " + columnString + "\nWHERE userid = $" + userIdIndex.toString() + "\nRETURNING *"
    const client = await pool.connect()
    try {
        const res = await client.query(sql, columns)
        return res.rows;
    } finally {
        client.release();
        return null
    }
}

export async function updateStreak(userId: string, username: string, message: Message): Promise<string> {
    const writer: Writer = await getWriterByUserId(userId, username)
    if (!writer) {
        throw("Couldn't find writer with id: " + userId)
    }

    let lastTimeWrote = writer.lasttimewrote
    let messageDate = message.createdAt
    let messageTimestamp = message.createdTimestamp
    let today = new Date()
    let isToday = today.setHours(0, 0, 0, 0) == messageDate.setHours(0, 0, 0, 0)
    let returnMessage = ""
    logToFile("Last time wrote: " + lastTimeWrote)
    //message written today but no previous write time has been recorded
    if (lastTimeWrote == null) {
        if (isToday) {
            writer.streak = 1;
            writer.lasttimewrote = new Date(message.createdTimestamp)
            logToFile("Last time wrote after timestamp conversion: " + writer.lasttimewrote)
            //await writer.save();
            //await writer.updateOne({ _id: currentWriter._id }, { $set: {lastTimeWrote: messageDate }})
            //return "\nLooks like this is the first time you've tracked a message on the current day, time to start a streak!";
            await updateColumns(userId, ["streak", "lasttimewrote"], [1, writer.lasttimewrote])
            return "\nLooks like this is the first time you've tracked a message on the current day, time to start a streak!";
        }
        else {
            //await WriterModel.updateOne({ _id: currentWriter._id }, { $set: {lastTimeWrote: messageDate }})
            await updateColumns(userId, ["lasttimewrote"], [new Date(message.createdTimestamp)])
            return "";
        }
    }
    lastTimeWrote = new Date(lastTimeWrote)
    let daysDiff = Math.floor((today.getTime() - lastTimeWrote.getTime()) / (36e5 * 24))
    let isStreakDead = daysDiff > 1
    //let isStreakActive = daysDiff == 0
    let shouldStreakContinue = today.getDay() != lastTimeWrote.getDay() && daysDiff < 2
    if (lastTimeWrote < messageDate) {
        writer.lasttimewrote = new Date(messageTimestamp)
        //console.log("Last time wrote after timestamp conversion: " + writer.lasttimewrote + "is streak dead: " + isStreakDead + " | days diff: ", daysDiff)
    }
    if (shouldStreakContinue) {        
        writer.streak += 1        
        if (writer.streak > writer.longeststreak) {
            writer.longeststreak = writer.streak;
        }
        //await currentWriter.save();
        await updateColumns(userId, ["streak", "longeststreak", "lasttimewrote"], [writer.streak, writer.longeststreak, writer.lasttimewrote])
        return "\nNice job! Your streak grows and is now " + writer.streak + " days!";
    }
    if (isStreakDead) {
        writer.streak = 1
        await updateColumns(userId, ["streak", "lasttimewrote"], [writer.streak, writer.lasttimewrote])
        //await currentWriter.save();
        return "\nYou have started a new streak of " + writer.streak + " day!";
    }
    await updateColumns(userId, ["lasttimewrote"], [writer.lasttimewrote])
    return "";
}

export async function updateWordCount(userId: string, words: number, username: string) {
    const writer: Writer = await getWriterByUserId(userId, username)
    let newWordCount = parseInt(writer.wordcount.toString()) + words;
    await updateColumns(userId, ["wordcount"], [newWordCount])
    //const result = await WriterModel.updateOne({userId: userId}, {$inc: {wordCount: words}})
    //const updatedWordCount = await WriterModel.findOne({userId: userId})
    logToFile("updated word count for " + username + " which is now " + newWordCount)
    return newWordCount
}