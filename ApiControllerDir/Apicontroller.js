const express = require('express');
//We have imported the user schema here
const User = require('../Models/User');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const routes = express.Router();
const connection = require('../Utils/connection');
const Grid = require("gridfs-stream");
const dotenv   = require('dotenv');
const mongoose = require('mongoose');
const  {GridFsStorage} = require('multer-gridfs-storage');
const crypto = require('crypto');
const path = require('path');
const jwt  = require('jsonwebtoken');
const Role = require("../Utils/role");
var storage ;

//Let Verify Our Endpoints Are Working
dotenv.config();

 
let MONGO_URL = process.env.MONGO_URL;


let connectionGfs = null;
let uploadImage = null;
connection().then(async ()=>{

    //Open The Stream
    const conn = mongoose.createConnection(MONGO_URL);
    conn.once("open", function() {
        connectionGfs = Grid(conn.db, mongoose.mongo);
        connectionGfs.collection('uploads');
         console.log("MongoDB Connected Created");
    });
    
    //Create The Storage Bucket 
    storage = new GridFsStorage({
        url: MONGO_URL,
        file: (req, file) => {
            //This is neccessary
            return new Promise((resolve, reject) => {
                crypto.randomBytes(16, (err, buf) => {
                    if (err) {
                        return reject(err);
                    }
                    //we generate a file name
                    const filename = buf.toString('hex') + path.extname(file.originalname);
                    const fileInfo = {
                        filename: filename,
                        //Name is same as stream 
                        bucketName:'uploads'
                    };
                    resolve(fileInfo);
                });
            });
        }
    });
    uploadImage = multer({ storage });


     routes.get('/', (req, res) => {
        res.send("This Is My First RestApi Route , I am Happy it worked..yipeeee");
    });
    //Create middleWare For Every Endpoint That Requires image upload
    //Login User
    routes.post('/login', async (req, res) => {
        
        try {
            if (req.body.email!= null) {
                //We Have To Check If The User Exist
                const user = await User.findOne({email:req.body.email}); 
                !user && res.status(404).json({
                    message: "User Does Not Exist,Register User",
                });
     
                const validPassword = await bcrypt.compare(req.body.password , user.password);
                !validPassword && res.status(404).json({
                        message:"Invalid Credentials,  Check Login Details",
                });
                
                console.log("This is Role : "+Role.USER);

                //We are going to use our token to know if user is ADMIN or Not 
                const access_token = jwt.sign(
                    {
                        id:user.id,
                        role:Role.USER
                    },
                    process.env.SECRET_KEY,
                    {expiresIn:"3d"}
                )
                
                //Lets Go to Postman
                //INSTALL JWT
                if (user!= null) {
                    res.json(
                        {
                            message: "Success",
                            ...user._doc,
                            //JWT
                            token:access_token,
                        }
                    );
                }
                res.send("This is login RestApi routes");
            } else {
                res.status(400).json({
                    message: "Email Is Required Here"
                })
            }
    
        } catch (error) {
                console.log("An Error Occured "+error.message);
        }
    
    });
    
    //Upload Profile Picture 
    //Sigu Up User
    routes.post('/signup',uploadImage.single("image"),async (req, res) => {
     
        try {
            if (req.body.password!= null) {
    
                //Generate Salt
                const salt = await bcrypt.genSalt(10);
                const hashPassword = await bcrypt.hash(req.body.password,salt);
    
                console.log(req.file);
                if (req.body.email != null) {
                    const user = await new User({
                        name: req.body.name,
                        email: req.body.email,
                        //added this for the profile picture 
                        profilePicture:req.file!=null ? req.file.filename:null,
                        password:hashPassword,
                    });
                    await user.save();
                    //Return Json To The User
                    res.json({
                        user_details:user,
                        message:"Successfully Registered",
                        imageurl:req.file!=null ?"http://localhost:9000/api/files/"+req.file.filename:null
                    });
                } else {
                    res.status(400).json({
                        message: "Email Is Required",
                    })
                }
            } else {
                res.status(400).json({
                    message: "Password Is Required",
                });
            }
        } catch (error) {
            console.log("An Error Occured " +error.message)
        }
    
    });
    
    //Retrieve all Files
    routes.get('/api/files', (req, res) => {
        res.send("RestApi Retrieve All Files");
    });
    
    //Retrieve A Specific Files
    //MongoDB GridFs-Stream
    //@Params:filename 
    routes.get('/api/files/:filename', (req, res) => {
        connectionGfs.files.findOne({filename:req.params.filename},(err , file) => {
           
            //if there is no file
            if (!file || file.length==0){
                console.log("There is no file");
                 res.status(404).json({
                     error:"404",
                     message:"The Resource Does Not Exist , Invalid request",
                 })
            }else{
                console.log("There is file");
                 res.set({
                     "Content-Type":file.contentType
                 });
                 
                 //CORRECTION
                 const readStream=connectionGfs.createReadStream(file.filename);
                 readStream.pipe(res);
                 //Time To Test On PostMan
            }
        })
    }); 
});
module.exports = routes;