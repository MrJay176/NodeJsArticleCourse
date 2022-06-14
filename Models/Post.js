const mongoose = require("mongoose");

const postschema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    //No Title Should be the same
    unique:true
  },
  description: {
    type: String,
    required: true,
    default: "No Description",
  },
  img: [
    // Image Upload(Multiple)
    {
      filename: {
        type: String,
      },
    },
  ],
  category:{
      type:Array,
      required:true,
      default:["politics","fashion"]
  },

},{timestamps:true});

const Post = mongoose.model("posts",postschema);
module.exports = Post;