const dotenv   = require('dotenv');
 const  {GridFsStorage} = require('multer-gridfs-storage');
const crypto = require('crypto');
const connection = require('./connection');

dotenv.config();

var storage ;
let MONGO_URL = process.env.MONGO_URL;
      
    connection().then( async ()=>{
           //Set Up The Storage
    //Mongo Url and File
    storage = new GridFsStorage({
        url:MONGO_URL,
        file:(req , file)=>{
            return new Promise((resolve , reject)=>{
                //We will use crypto here to create the bytes from the file
                crypto.randomBytes(16 , (err , buff) =>{
                      if(err){
                          return reject(err);
                      }
                    
                    //we are going to resolve the file info
                    const filename = buff.toString('hex') + path.extname(file.originalname);
                    const fileInfo = {
                        filename:filename,
                        bucketname:'uploads'
                    };
                    resolve(fileInfo); 
                    //multer
                })
            })
        }
});
    })
    
  

module.exports = storage;