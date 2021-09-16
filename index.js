//This will import the express
const express = require('express');
const mongoose = require('mongoose');
const dotenv   = require('dotenv');
const User = require("./Models/User");


const Apicontroller = require('./Models/ApiControllerDir/Apicontroller');

dotenv.config();
let RestApiapp = null;
//port for out RestApiapp Connection
let port = null;
let MONGO_URL = null;

//Function To Intialize Our Variables
const initVar = async () => {
    port = process.env.PORT;
    MONGO_URL = process.env.MONGO_URL;
    RestApiapp = express();
}

//Create MiddleWare Function
middleware = async ()=>{
   
    //This Will Help Us Get Json Response For Our Api
    RestApiapp.use(express.urlencoded({extended:false}));
    RestApiapp.use(express.json({extended:false}));  

    RestApiapp.use('/',Apicontroller);
    RestApiapp.use('/api/auth/login',Apicontroller);
    RestApiapp.use('/api/auth/signup',Apicontroller);

}

//Connect MongoDB
const connectDB = async () => {
    try {
        //Connect
       await mongoose.connect(MONGO_URL, {
                useNewUrlParser:true,
                useFindAndModify:false,
                useUnifiedTopology:true,
                bufferCommands:false,
                autoIndex:false,
        });
        console.log("MongoDB Have Been Connected");
    } catch (error) {
        console.log("Error connecting MongoDB"+error);
    }
}

const ListenToPort = async()=>{
    RestApiapp.listen(port, async () => {
        console.log("Rest Api Port Connected " + port);
    });
}
//Trigger the function
initVar().then(() => {
    ListenToPort().then(()=>{
        middleware().then(()=>{
            connectDB();
        })
    })
});

