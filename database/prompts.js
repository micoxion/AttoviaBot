const { MongoClient } = require('mongodb');
const { logToFile } = require('../utility/logger.js');

const mongoose = require('mongoose');

require('dotenv').config()
const url = process.env.MONGODB_CONNECTION;
mongoose.connect(url)

const promptSchema = new mongoose.Schema({
    day: Number,
    prompt: String,
    date: Date,
    source: String,
    originalMessage: String
});

const Prompt = mongoose.model('Prompt', promptSchema, 'prompts')

exports.addPrompt = async function addPrompt(promptData) {
    const newPrompt = new Prompt({
        day: promptData.day,
        prompt: promptData.prompt,
        date: promptData.date,
        source: promptData.source,
        originalMessage: promptData.originalMessage
    })
    await newPrompt.save();
    return newPrompt;
}

exports.getPromptByDay = async function getPromptByDay(day) {
    const result = await Prompt.findOne({day: day})
    return result;
}

exports.getRandomPrompt = async function getRandomPrompt() {
    const result = await Prompt.aggregate([
        { $sample: {size: 1} }
    ]).exec()
    console.log(result)
    return result[0]
}