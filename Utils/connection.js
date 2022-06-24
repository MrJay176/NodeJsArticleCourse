//This Will Handle MongoDb Connection
const mongoose = require('mongoose');
const dotenv   = require('dotenv');

dotenv.config();

let MONGO_URL = process.env.MONGO_URL;

//Connect MongoDB
const connectDB = async () => {
    try {
        //Connect
       await mongoose.connect(MONGO_URL,{
                useNewUrlParser:true,
                useFindAndModify:false,
                useUnifiedTopology:true,
                bufferCommands:false,
                autoIndex:true,
                
        });
        console.log("connected to mongoDB");
    } catch (error) {
        console.log("Error connecting MongoDB"+error);
    }

}

module.exports=connectDB