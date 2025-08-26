const { MongoClient } = require('mongodb')

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
    let message = await messagesCountedCollection.findOne({messageId: messageId})
    console.log(message)
    if (message == null) {
        return false;
    }
    return true
}

exports.recordMessageTracked = async function(messageId) {
    await messagesCountedCollection.insertOne({messageId: messageId})
}