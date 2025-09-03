const { MongoClient, Timestamp } = require('mongodb')
const { logToFile } = require('../utility/logger.js')

const mongoose = require('mongoose');
const { application } = require('express');

require('dotenv').config(); 
const url = process.env.MONGODB_CONNECTION;
mongoose.connect(url);

const writerSchema = new mongoose.Schema({
    userId: String,
    username: String,
    streak: Number,
    longestStreak: {
        type: Number,
        get: (ls) => {
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

const Writer = mongoose.model('Writer', writerSchema, "writers");

async function addWriter(writerData) {
    //TODO: Data checking
    //const newWriter = writerData;

    //await writerCollection.insertOne(newWriter);
    const newWriter = new Writer({
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

async function checkWriter(writerData) {
    console.log("From checkWriter: ", writerData);
    const result = await Writer.findOne({userId: writerData.userId})
    if (result == null) {
        console.log("adding writer")
        let newWriter = await addWriter({
            userId: writerData.id,
            username: writerData.username,
            streak: writerData.streak || 0,
            wordCount: writerData.wordCount || 0,
            lastTimeWrote: writerData.lastTimeWrote || new Date(0)
        })
        return newWriter
    }
    return null
}

exports.getWriterByUserId = async function(userId, username) {
    await checkWriter({userId: userId, username: username})
    let writer = await Writer.findOne({userId: userId});
    console.log("WRITER: ", writer)
    return writer;
}

exports.getAllWriters = async function() {
    //let allWriters = await writerCollection.find().toArray();
    //return allWriters;
    console.log(Writer.db.host);
    console.log(Writer.db.name);
    let allWriters = await Writer.find();
    allWriters.forEach((writer) => {
        console.log(writer.lastTimeWrote);
    })
    return allWriters;
}

exports.updateStreak = async function(userId, message) {
    let currentWriter = await Writer.findOne({userId: userId})
    let lastTimeWrote = currentWriter.lastTimeWrote
    let messageDate = message.createdAt
    let today = new Date()
    let isToday = today.setHours(0, 0, 0, 0) == messageDate.setHours(0, 0, 0, 0)
    logToFile("Last time wrote: " + lastTimeWrote)
    //message written today but no previous write time has been recorded
    if (lastTimeWrote == null && isToday) {
        //currentWriter.lastTimeWrote = messageDate;
        currentWriter.streak = 1;
        await currentWriter.save();
        await Writer.updateOne({ _id: currentWriter._id }, { $set: {lastTimeWrote: messageDate }})
        return "\nLooks like this is the first time you've tracked a message on the current day, time to start a streak!";
    }
    //message was not written today but no previous write time has been recorded
    if (lastTimeWrote == null && !isToday) {
        // currentWriter.lastTimeWrote = messageDate;
        // await currentWriter.save();
        await Writer.updateOne({ _id: currentWriter._id }, { $set: {lastTimeWrote: messageDate }})
        return "";
    }
    let daysDiff = Math.floor((today - lastTimeWrote) / (36e5 * 24))
    let isStreakDead = daysDiff > 1
    //let isStreakActive = daysDiff == 0
    let shouldStreakContinue = daysDiff == 1
    if (lastTimeWrote < messageDate) {
        currentWriter.lastTimeWrote = messageDate
    }
    if (shouldStreakContinue) {
        currentWriter.streak++;
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

exports.updateWordCount = async function(userId, words, username) {
    console.log("From updateWordCount: ", userId)
    let newWriter = await checkWriter({userId: userId, username: username})
    const result = await Writer.updateOne({userId: userId}, {$inc: {wordCount: words}})
    const updatedWordCount = await Writer.findOne({userId: userId})
    logToFile("updated word count for " + username + " which is now " + updatedWordCount.wordCount)
    return updatedWordCount.wordCount
}