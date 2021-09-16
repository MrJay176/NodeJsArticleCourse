//This File Will Describe Our User
const mongoose = require('mongoose');

//Create a Model For The User
const userSchema = new mongoose.Schema({
    name: {
        type:String,
        default:"",
    },
    email: {
        type: String,
        //A User Cannot Register WithOut Email
        required:true,
        //No Other User Can Have The Same Email
        unique:true,
    },
    password:{
        type:String,
        //A User Cannot Register Without Password
        required:true,  
    },
    profilePicture: {
        type: String,
        default:"",
    },
    coverPhoto: {
        type: String,
        default:"",
    },
    following: {
        type: Array,
        default:[]
    },
    followers: {
        type: Array,
        default:[]
    },
},
    { timestamps: true }
);

const User = mongoose.model("MyUser",userSchema);
module.exports = User;