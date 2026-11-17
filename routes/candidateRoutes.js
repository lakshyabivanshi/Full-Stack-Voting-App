const express = require('express');
const router = express.Router();
const Candidate = require('./../models/candidate');
const User = require('./../models/user');

const { jwtAuthMiddleware, generateToken } = require('./../jwt');

const checkAdminRole = async (userID) => {
    try {
        const user = await User.findById(userID);
        return user.role === 'admin';
    } catch (err) {
        return false;
    }
}

// Post route to add a candidate
router.post('/', jwtAuthMiddleware, async (req, res) => {
    try {
        // 1. Check admin role using req.user.id (token se id milti hai)
        if (!(await checkAdminRole(req.user.id))) {
            return res.status(403).json({ message: "The user does not have admin role" });
        }

        // 2. Candidate ka data req.body se lena hai
        const data = req.body; 

        // Create a new candidate document using the mongoose model
        const newCandidate = new Candidate(data);

        const response = await newCandidate.save();
        console.log("data saved");

        return res.status(200).json({ response: response });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.put('/:candidateID', jwtAuthMiddleware, async (req, res) => {
    try {
        if (!(await checkAdminRole(req.user.id)))
            return res.status(403).json({ message: "The user does not have admin role" });

        const candidateID = req.params.candidateID;
        const updateCandidateData = req.body;

        const response = await Candidate.findByIdAndUpdate(candidateID, updateCandidateData, {
            new: true, // Return updated document
            runValidators: true, // Run mongoose validation
        });

        if (!response) {
            return res.status(404).json({ error: "Candidate not found" });
        }

        console.log('candidate data updated');
        return res.status(200).json(response);
    } catch (err) {
        console.log(err);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.delete('/:candidateID', jwtAuthMiddleware, async (req, res) => {
    try {
        if (!(await checkAdminRole(req.user.id)))
            return res.status(403).json({ message: "The user does not have admin role" });

        const candidateID = req.params.candidateID;

        const response = await Candidate.findByIdAndDelete(candidateID);

        if (!response) {
            return res.status(404).json({ error: "Candidate not found" });
        }

        console.log('candidate deleted');
        return res.status(200).json(response);
    } catch (err) {
        console.log(err);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});

//Lets start voting
router.post('/vote/:candidateID', jwtAuthMiddleware, async (req, res)=>{
    //no admin can vote
    //user can only vote once

    const candidateID = req.params.candidateID;
    const userId = req.user.id;

    try{
        //Find candidate document with the specified candidateID
        const candidate = await Candidate.findById(candidateID);
        if(!candidate){
            return res.status(404).json({message: 'Candidate not found'});
        }
        const user = await User.findById(userId);
        if(!user){
            return res.status(404).json({message: 'User not found'});
        }

        // यहाँ return जोड़ दिया गया है ताकि रिस्पांस भेजने के बाद कोड आगे न बढ़े
        if(user.isVoted){
            return res.status(400).json({message: 'You have already voted!'});
        }
        if(user.role==='admin'){
            return res.status(403).json({message: 'Admin is not allowed!'});
        }

        candidate.votes.push({user: userId});
        candidate.voteCount++;
        await candidate.save();

        //update user document
        user.isVoted = true;
        await user.save();

        return res.status(200).json({ message: 'Vote recorded successfully!'});
    }catch(err){
        console.log(err);
        return res.status(500).json({error: 'Internal server error'});
    }
});

router.get('/vote/count', async (req, res)=>{
    //find all candidates and sort them to voteCount in descending order

    try{
        const candidate = await Candidate.find().sort({voteCount: 'desc'});

        const voteRecord = candidate.map((data)=>{
            return{
                party: data.party,
                count: data.voteCount
            }
        });

        return res.status(200).json(voteRecord);

    }catch(err){
        console.log(err);
        return res.status(500).json({error: 'Internal server error'});
    }
});

// Get List of all candidates with only name and party fields
router.get('/', async (req, res) => {
    try {
        // Find all candidates and select only the name and party fields
        const candidates = await Candidate.find({}, 'name party');

        // Return the list of candidates
        return res.status(200).json(candidates);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;