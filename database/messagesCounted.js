const { MongoClient } = require('mongodb')
const { logToFile } = require('../utility/logger.js')

require('dotenv').config(); 

const url = process.env.MONGODB_CONNECTION;
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

exports.hasMessageBeenCounted = async function(messageId) {
    let message = await messagesCountedCollection.findOne({messageId: messageId});
    if (message == null) {
        return false;
    }
    logToFile("Message was already counted: " + messageId);
    return true;
}

exports.recordMessageTracked = async function(messageId) {
    await messagesCountedCollection.insertOne({messageId: messageId});
    logToFile("Message " + messageId + " successfully tracked");
}