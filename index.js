//This will import the express
const express = require('express');
const mongoose = require('mongoose');
const dotenv   = require('dotenv');
const User = require("./Models/User");
const connection = require('./Utils/connection');

const Apicontroller  = require('./ApiControllerDir/Apicontroller');
const PostController = require('./ApiControllerDir/Postcontroller');

dotenv.config();
let RestApiapp = null;
//port for out RestApiapp Connection
let port = null;


//Function To Intialize Our Variables
const initVar = async () => {
    port = process.env.PORT || 9000;
    RestApiapp = express();
}

//Create MiddleWare Function
middleware = async ()=>{
   
    //This Will Help Us Get Json Response For Our Api
    RestApiapp.use(express.urlencoded({extended:false}));
    RestApiapp.use(express.json({extended:false}));  

    //RestApiapp.use('/',Apicontroller);
    RestApiapp.use('/api/auth/',Apicontroller);
    RestApiapp.use('/api/post/',PostController);

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
            connection();
        })
    })
});

