const express = require('express');
//We have imported the user schema here
const User = require('../User');

const bcrypt = require('bcrypt');

const routes = express.Router();

routes.get('/', (req, res) => {
    res.send("This Is My First RestApi Route , I am Happy it worked..yipeeee");
});

//Login User
routes.post('/api/auth/login', async (req, res) => {
    
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
             
            //Lets Go to Postman

            if (user!= null) {
                res.json(
                    {
                        message: "Success",
                        body: user
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

//Sigu Up User
routes.post('/api/auth/signup', async (req, res) => {

    try {
        if (req.body.password!= null) {

            //Generate Salt
            const salt = await bcrypt.genSalt(10);
            const hashPassword = await bcrypt.hash(req.body.password,salt);

            if (req.body.email != null) {
                const user = await new User({
                    name: req.body.name,
                    email: req.body.email,
                    password:hashPassword,
                });
                await user.save();
                //Return Json To The User
                res.json({
                    message:"Successfully Registered",
                    token:hashPassword
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
        console.log("An Error Occured " + error.message)
    }

});

//Retrieve all Files
routes.get('/api/files', (req, res) => {
    res.send("RestApi Retrieve All Files");
});

//Retrieve A Specific Files
routes.get('/api/files/:filename', (req, res) => {
    res.send("RestApi Retrieve Specific Files");
});

module.exports = routes;