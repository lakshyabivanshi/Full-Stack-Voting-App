const express = require('express');
const router = express.Router();
const User = require('./../models/user') ;
const {jwtAuthMiddleware, generateToken} = require('./../jwt');

// POST route to add a person
router.post('/signup', async (req, res) =>{
    try{
        const data = req.body // Assuming the request body contains the person data

        if(data.role === 'admin'){
            const existingAdmin = await User.findOne({role: 'admin'});
            if(existingAdmin){
                return res.status(400).json({error: 'Admin already exists! Only one admin is allowed in the system.'})
            }
        }

        // Create a new Person document using the Mongoose model
        const newUser = new User(data);

        // Save the new person to the database
        const response = await newUser.save();
        console.log('data saved');

        const payload = {
            id: response.id,
        }
        console.log(JSON.stringify(payload));
        const token = generateToken(payload);
        console.log("Token is : ", token);

        res.status(200).json({response: response, token: token});
    }
    catch(err){
        console.log(err);
        res.status(500).json({error: 'Internal Server Error'});
    }
})

// Login Route
router.post('/login', async(req, res) => {
    try{
        // Extract aadharCardNumber and password from request body
        const {aadharCardNumber, password} = req.body;

        // Find the user by username
        const user = await User.findOne({aadharCardNumber: aadharCardNumber});

        // If user does not exist or password does not match, return error
        if( !user || !(await user.comparePassword(password))){
            return res.status(401).json({error: 'Invalid Aadharcard Number or Password'});
        }

        // generate Token 
        const payload = {
            id: user.id,
            role: user.role
        }
        const token = generateToken(payload);

        // resturn token as response
        res.json({token})
    }catch(err){
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Profile route
router.get('/profile', jwtAuthMiddleware, async (req, res) => {
    try{
        const userData = req.user;
        const userId = userData.id;
        const user = await User.findById(userId);
        if(!user){
            return res.status(404).json({ error: 'User Not Found'});
        }
        // यहाँ {user} की जगह सीधे user भेजें ताकि frontend पर res.role सही से मिल सके
        return res.status(200).json(user);
    }catch(err){
        console.error(err);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});



router.put('/profile/password', async (req, res)=>{
    try{
        const userId = req.user.id; // Extract the id from the token
        const {currentPassword, newPassword} = req.body; // Extract current and new password from the request body

        //Find the user by the session id

        const user = await User.findById(userId);

          // If password does not exist or password does not match, return error
        if(!(await user.comparePassword(currentPassword))){
            return res.status(401).json({error: 'Invalid Aadharcard Number or Password'});
        }

        //Update user password
        user.password = newPassword;
        await user.save();

        console.log('password updated');
        res.status(200).json({message: "Password Updated"});
    }catch(err){
        console.log(err);
        res.status(500).json({error: 'Internal Server Error'});
    }
})


module.exports = router;