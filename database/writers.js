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

exports.addWriter = async function(writerData) {
    //TODO: Data checking
    //const newWriter = writerData;

    //await writerCollection.insertOne(newWriter);
    const newWriter = new Writer({
        userId: writerData.userId,
        username: writerData.username,
        streak: 0,
        wordCount: 0,
        lastTimeWrote: new Date().getTime() / 1000 //convert to epoch
    });
    await newWriter.save();
}

exports.getWriterByUserId = async function(userId) {
    let writer = await Writer.find({userId: userId});
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

exports.updateWordCount = async function(userId, words) {
    const result = await Writer.updateOne({userId: userId}, {$inc: {wordCount: words}})
    const updatedWordCount = await Writer.findOne({userId: userId})
    return updatedWordCount.wordCount
}