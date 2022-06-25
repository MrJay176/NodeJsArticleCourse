const express = require("express");
const bcrypt = require("bcryptjs");
const multer = require("multer");
const routes = express.Router();
const connection = require("../Utils/connection");
const Grid = require("gridfs-stream");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const { GridFsStorage } = require("multer-gridfs-storage");
const crypto = require("crypto");
const path = require("path");
const Post = require("../Models/Post");
const Token = require("../Utils/verifyToken");

dotenv.config();

//STEPS TO UPLOAD IMAGES
//Because we are uploading images
//Open the connection with mongo url
//create a collection destination folder
//Create Storage
//Insert Storage info in multer

let MONOG_URL = process.env.MONGO_URL;
let gfs = null;
let storage = null;

connection().then(async () => {
  const conn = mongoose.createConnection(MONOG_URL);
  conn.once("open", function () {
    gfs = Grid(conn.db, mongoose.mongo);
    gfs.collection("uploads");
    console.log("Connection Open For Uploads PostControler");
  });

  //Create Storage Object
  storage = new GridFsStorage({
    url: MONOG_URL,
    file: (req, file) => {
      return new Promise((resolve, reject) => {
        // If there is an error reject the file
        //resolve the file
        crypto.randomBytes(16, (error, buff) => {
          if (error) {
            return reject(error);
          }
          //if there is no error generate filename
          const Filename =
            buff.toString("hex") + path.extname(file.originalname);
          const fileInfo = {
            filename: Filename,
            bucketName: "uploads",
          };
          resolve(fileInfo);
        });
      });
    },
  });
  uploadImage = multer({ storage });
  //We are set to upload our images

  //find a single post by Id
  routes.get("/find/:id" , async (req,res)=>{
      let id = req.params.id;
      let post = await Post.findById(id);
      res.status(200).json({...post._doc})
  })
  
  //Get all the post
  // You Have to be authenticated to see articles
  routes.get("/", Token.verifyToken , async (req, res) => {

    let query_string = req.query.category;
    let query_latest = req.query.latest;
    
    let post = null;

    try {
     
        if(query_string){
            post = await Post.find({category:{$in:[query_string]}});
        }else if(query_latest){
            post = await Post.find().sort({createdAt:-1}).limit(7);
        }else{
            post = await Post.find();
        }
        
      res.status(200).json({
        message:"success",  
        post:post,
      });
    } catch (err) {
      res.status(500).json({
        message: "error retrieving post",
        error:err
        
      });
    }
  });

  //We have to be sure the user has permissions to upload ADMIN , That the user is authenticated
  // Only Login users who are admins can upload post
  // Retrieving and Viewing Post with images
  //Upload Post
  routes.post(
    "/uploadPost", 
     [ Token.verifyTokenWithAuthorization , uploadImage.array("images", 50)],
    async (req, res) => {
      //Time To Use PostMan
      try{
      //Getting all files from the request body
      var array = req.files;
      let array_url = [];
      //loop through the array to get each filename
      for (var i = 0; i <= array.length; i++) {
        var item = array[i];
        if (item != undefined){
          let url = item.filename;
          array_url.push({ filename: url });
        }
      }


      try {
        const post = await new Post({
          title: req.body.title,
          description: req.body.description,
          img: array_url,
          //Array
          category: req.body.categories,
        });
        await post.save();

        res.json({
          message:"sucessfully uploaded post",
          ...post._doc,
        });
      } catch (err) {
        res.json({
          message: "error uploading post" + err,
        });
      }
      }catch(err){
        res.status(200).json({
          message:"Error Uploading Post",
        })
      }
    }
  );
});

//Authorization in node.js 

//Route for get post based on category and latest

module.exports = routes;
