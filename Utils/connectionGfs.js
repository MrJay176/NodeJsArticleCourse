const mongoose = require('mongoose');
const dotenv   = require('dotenv');
const GridStream = require('gridfs-stream');
const connection = require('./connection');
const storageGfs = require('./storageGfs');
const multer = require('multer');

const dotenv   = require('dotenv');
dotenv.config();

let MONGO_URL = process.env.MONGO_URL;
let connectionGfs ;

//Establish The Connection To GridStream
const create = async ()=>{
     connection().then(async ()=>{
          const conn = await mongoose.createConnection(MONGO_URL);
          conn.once('open', function() {
               connectionGfs = GridStream(conn.db, mongoose.mongo);
               connectionGfs.collection('uploads');
               console.log("MongoDB Connected");
          });
      });      
}

create();

 module.exports = connectionGfs;