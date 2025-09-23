import { Prompt } from "../ABTypes/Prompt";

import { MongoClient } from 'mongodb';
import { logToFile } from '../utilities/logger';

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

const PromptModel = mongoose.model('Prompt', promptSchema, 'prompts')

export async function addPrompt(promptData: Prompt) {
    const newPrompt = new PromptModel({
        day: promptData.day,
        prompt: promptData.prompt,
        date: promptData.date,
        source: promptData.source,
        originalMessage: promptData.originalMessage
    })
    await newPrompt.save();
    return newPrompt;
}

export async function getPromptByDay(day: number) {
    const result = await PromptModel.findOne({day: day})
    return result;
}

export async function getRandomPrompt() {
    const result = await PromptModel.aggregate([
        { $sample: {size: 1} }
    ]).exec()
    console.log(result)
    return result[0]
}