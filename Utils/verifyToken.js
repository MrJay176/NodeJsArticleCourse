 //This class will help to check certain permissions of the user 
const jwt    = require("jsonwebtoken");
const dotenv = require("dotenv");
const Role = require("../Utils/role");
const User = require('../Models/User');
dotenv.config();

let SECRET_KEY = process.env.SECRET_KEY;

//req : incoming request
//res : response from middleware
//next: next action
const verifyToken = (req,res,next) =>{
    //get the headers from incoming request then get token
    var token =req.headers.authorization;

    if(token){
        token = token.replace(/^Bearer\s+/,"");
        console.log("Token Found");

        //we have to verify the token (jsonwebtokens)
        //token
        //secret_key
        //call back function   
         jwt.verify(token,SECRET_KEY ,async (err,data)=>{
                      //if the token format is wrong    
                      if(err){                
                        res.status(401).json({
                          message:"Invalid Token Used , try Again",
                          success: false,
                          input: token
                      });
                      return;
                    }
                      //Create req data   
                      req.data = data;
                      console.log("This is checking id inside data "+data.id)
                      const userResult = await User.findById(data.id);
                      req.role = userResult.isAdmin;
                      console.log("role "+req.role);
                      //After getting data value
                      next();   
         })
     }else{
      return res.status(401).json({
          message:"You are not authenticated , Please register or login ",
          status:"error", 
      });
      return;
    }
}

//Use the token for authorization roles check if user is admin or not
const verifyTokenWithAuthorization = (req , res , next) => {
    verifyToken(req, res ,()=>{
          
          if(req.data != undefined){
            var id = req.data.id;
              //we are gonna use the id to find the user in the database
          //We imort the user schema because we are making use of it to find out user in the database
          
          //Check if the user is admin
          var isAdmin = req.role;
          if(isAdmin){
           next();
          }else{
             res.json({
                 message:"Only Admin Can Upload Post Here",
                 status:"Error",
             });
             return;
          }
          }else{
            res.json({
                message:"Invalid User",
                status:"Error",
            });
            return;
          }
        
    });
} 

//verifyToken:=> Handles only Authentication Checks
//verifyTokenWithAuthorization:=> Handles both Authentication and Authorization Checks
module.exports = { verifyToken , verifyTokenWithAuthorization};

