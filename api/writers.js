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
ConnectDB()

exports.addWriter = async function(req, res) {
    const newWriter = req.body;

    const db = mongoClient.db("WordCount");
    const writerCollection = db.collection("writers");

    await writerCollection.insertOne(newWriter);
    res.status(200).send("Writer added successfully!");
}