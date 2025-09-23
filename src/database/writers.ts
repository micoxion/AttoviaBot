import { MongoClient, Timestamp } from 'mongodb';
import { logToFile } from '../utilities/logger';

import mongoose from 'mongoose';
import { Writer } from '../ABTypes/Writer';
import { Message } from 'discord.js';

require('dotenv').config(); 
const url = process.env.MONGODB_CONNECTION;
if (url == undefined) {
    throw("MongoDB Connection not defined in .ENV file!")
}
mongoose.connect(url);

const writerSchema = new mongoose.Schema({
    userId: String,
    username: String,
    streak: Number,
    longestStreak: {
        type: Number,
        get: (ls: number) => {
            if (ls == null) {
                return 0;
            }
            return ls;
        }
    },
    wordCount: Number,
    lastTimeWrote: Date
});

/*writerSchema.methods.getStreak = function getStreak() {
    let output = "";
    if (this.streak > 0) {
        output = this.username + " has a writing streak of " + this.streak + " day(s).";
    }
    else {
        output = this.username + " does not currently have a streak!";
    }
    return output;
}*/

const WriterModel = mongoose.model('Writer', writerSchema, "writers");

async function addWriter(writerData: Writer) {
    //TODO: Data checking
    //const newWriter = writerData;

    //await writerCollection.insertOne(newWriter);
    const newWriter = new WriterModel({
        userId: writerData.userId,
        username: writerData.username,
        streak: writerData.streak || 0,
        longestStreak: writerData.longestStreak || 0,
        wordCount: writerData.wordCount || 0,
        lastTimeWrote: writerData.lastTimeWrote || new Date(0) //new Date().getTime() / 1000 //convert to epoch
    });
    await newWriter.save();
    return newWriter;
}

async function checkWriter(writerData: Writer) {
    console.log("From checkWriter: ", writerData);
    const result = await WriterModel.findOne({userId: writerData.userId})
    if (result == null) {
        console.log("adding writer")
        let newWriter = await addWriter({
            userId: writerData.userId,
            username: writerData.username,
            streak: writerData.streak || 0,
            longestStreak: writerData.longestStreak || 0,
            wordCount: writerData.wordCount || 0,
            lastTimeWrote: writerData.lastTimeWrote || new Date(0)
        })
        return newWriter
    }
    return null
}

export async function getWriterByUserId(userId: string, username: string) {
    await checkWriter({
        userId: userId, username: username,
        streak: 0,
        longestStreak: 0,
        wordCount: 0,
        lastTimeWrote: null
    })
    let writer = await WriterModel.findOne({userId: userId});
    console.log("WRITER: ", writer)
    return writer;
}

export async function getAllWriters() {
    //let allWriters = await writerCollection.find().toArray();
    //return allWriters;
    console.log(WriterModel.db.host);
    console.log(WriterModel.db.name);
    let allWriters = await WriterModel.find();
    allWriters.forEach((writer) => {
        console.log(writer.lastTimeWrote);
    })
    return allWriters;
}

export async function updateStreak(userId: string, message: Message) {
    let currentWriter = await WriterModel.findOne({userId: userId})
    if (currentWriter == null || currentWriter == undefined) {
        throw("Couldn't find writer with id: " + userId)
    }
    
    let lastTimeWrote = currentWriter.lastTimeWrote 
    let messageDate = message.createdAt
    let today = new Date()
    let isToday = today.setHours(0, 0, 0, 0) == messageDate.setHours(0, 0, 0, 0)
    logToFile("Last time wrote: " + lastTimeWrote)
    //message written today but no previous write time has been recorded
    if (lastTimeWrote == null) {
        if (isToday) {
            currentWriter.streak = 1;
        await currentWriter.save();
        await WriterModel.updateOne({ _id: currentWriter._id }, { $set: {lastTimeWrote: messageDate }})
        return "\nLooks like this is the first time you've tracked a message on the current day, time to start a streak!";    
        }
        else {
            await WriterModel.updateOne({ _id: currentWriter._id }, { $set: {lastTimeWrote: messageDate }})
            return "";
        }
    }
    // if (lastTimeWrote == null && isToday) {
    //     //currentWriter.lastTimeWrote = messageDate;
    //     currentWriter.streak = 1;
    //     await currentWriter.save();
    //     await WriterModel.updateOne({ _id: currentWriter._id }, { $set: {lastTimeWrote: messageDate }})
    //     return "\nLooks like this is the first time you've tracked a message on the current day, time to start a streak!";
    // }
    // //message was not written today but no previous write time has been recorded
    // if (lastTimeWrote == null && !isToday) {
    //     // currentWriter.lastTimeWrote = messageDate;
    //     // await currentWriter.save();
    //     await WriterModel.updateOne({ _id: currentWriter._id }, { $set: {lastTimeWrote: messageDate }})
    //     return "";
    // }
    let daysDiff = Math.floor((today.getTime() - lastTimeWrote?.getTime()) / (36e5 * 24))
    let isStreakDead = daysDiff > 1
    //let isStreakActive = daysDiff == 0
    let shouldStreakContinue = daysDiff == 1
    if (lastTimeWrote < messageDate) {
        currentWriter.lastTimeWrote = messageDate
    }
    if (shouldStreakContinue) {
        // @ts-ignore
        currentWriter.streak += 1
        // @ts-ignore
        if (currentWriter.streak > currentWriter.longestStreak) {
            currentWriter.longestStreak = currentWriter.streak;
        }
        await currentWriter.save();
        return "\nNice job! Your streak grows and is now " + currentWriter.streak + " days!";
    }
    if (isStreakDead) {
        currentWriter.streak = isToday ? 1 : 0
        await currentWriter.save();
        return "\nYou have started a new streak of " + currentWriter.streak + " day!";
    }
    return "";
}

export async function updateWordCount(userId: string, words: number, username: string) {
    console.log("From updateWordCount: ", userId)
    let newWriter = await checkWriter({
        userId: userId, username: username,
        streak: 0,
        longestStreak: 0,
        wordCount: 0,
        lastTimeWrote: null
    })
    const result = await WriterModel.updateOne({userId: userId}, {$inc: {wordCount: words}})
    const updatedWordCount = await WriterModel.findOne({userId: userId})
    logToFile("updated word count for " + username + " which is now " + updatedWordCount?.wordCount)
    return updatedWordCount?.wordCount
}