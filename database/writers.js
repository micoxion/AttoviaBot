const { MongoClient, Timestamp } = require('mongodb')

const mongoose = require('mongoose')

require('dotenv').config(); 
const url = process.env.MONGODB_CONNECTION;
mongoose.connect(url);

const writerSchema = new mongoose.Schema({
    userId: String,
    username: String,
    streak: Number,
    wordCount: Number,
    lastTimeWrote: { 
        type: Date, 
        get: d => new Date(d * 1000)
    }
})

writerSchema.methods.getStreak = function getStreak() {
    let output = "";
    if (this.streak > 0) {
        output = this.username + " has a writing streak of " + this.streak + " day(s).";
    }
    else {
        output = this.username + " does not currently have a streak!";
    }
    return output;
}

const Writer = mongoose.model('Writer', writerSchema, "writers");

async function addWriter(writerData) {
    //TODO: Data checking
    //const newWriter = writerData;

    //await writerCollection.insertOne(newWriter);
    const newWriter = new Writer({
        userId: writerData.userId,
        username: writerData.username,
        streak: writerData.streak || 0,
        wordCount: writerData.wordCount || 0,
        lastTimeWrote: writerData.lastTimeWrote || null //new Date().getTime() / 1000 //convert to epoch
    });
    await newWriter.save();
    return newWriter
}

async function checkWriter(writerData) {
    const result = await Writer.findOne({userId: writerData.userId})
    if (result == null) {
        console.log("adding writer")
        let newWriter = await addWriter({
            userId: writerData.userId,
            username: writerData.username,
            streak: writerData.streak || 0,
            wordCount: writerData.wordCount || 0,
            lastTimeWrote: writerData.lastTimeWrote || null
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

exports.updateWordCount = async function(userId, words, username) {
    let newWriter = await checkWriter({userId: userId, username: username})
    const result = await Writer.updateOne({userId: userId}, {$inc: {wordCount: words}})
    const updatedWordCount = await Writer.findOne({userId: userId})
    return updatedWordCount.wordCount
}