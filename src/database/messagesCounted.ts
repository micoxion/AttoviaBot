import { MongoClient } from 'mongodb';
import { logToFile } from '../utilities/logger';
import { Schema, connect } from 'mongoose'

require('dotenv').config(); 


//connect(process.env.MONGODB_CONNECTION || "");

// const messagesCountedSchema = new Schema({
//     messageId: string
// });

//const MessagesCountedModel = mongoose.model("MessagesCounted", messagesCountedSchema, "messagesCounted")

const url = process.env.MONGODB_CONNECTION;
if (url == undefined) {
    throw("MongoDB Connection not defined in .ENV file!")
}
const mongoClient = new MongoClient(url);

const ConnectDB = async()=>{
    try {
        await mongoClient.connect();
        console.log("DB is Running");
    }catch(e){
        console.log("error: ", e);
    }
}
ConnectDB();

const db = mongoClient.db("WordCount");
const messagesCountedCollection = db.collection("messagesCounted");

export async function hasMessageBeenCounted(messageId: string) {
    let message = await messagesCountedCollection.findOne({messageId: messageId});
    if (message == null) {
        return false;
    }
    logToFile("Message was already counted: " + messageId);
    return true;
}

export async function recordMessageTracked(messageId: string) {
    await messagesCountedCollection.insertOne({messageId: messageId});
    logToFile("Message " + messageId + " successfully tracked");
}

export async function getAllMessagesCounted() {
    let messages = await messagesCountedCollection.find();
    return messages
}