const express = require('express');
const router = express.Router();
const Vote = require("../models/vote")

//@@ GET /api/votes
//@@ Displays all submitted votes
router.get('/', async (req, res) => {
  try {
    const votes = await Vote.find();
    if(votes){
      res.send(votes);
    }
  } catch(err){
    console.log(err);
  }
})

//@@ GET /api/votes/:contestId
//@@ Displays all submitted votes for a particular contest
router.get('/:contestId', async (req, res) => {
  try {
    const votes = await Vote.find({ contestId: req.params.contestId});
    if(votes){
      res.send(votes);
    }
  } catch(err){
    console.log(err);
  }
})

//@@ POST /api/votes
//@@ Votes for a new submission
router.post('/', async (req, res) => {
  try {
    //check to see if user has voted in this contest already
    const newVote = new Vote({
      submissionId: req.body.submissionId,
      contestId: req.body.contestId,
      discordId: req.body.discordId,
      dateVoted: req.body.dateVoted
    })

    const votes = await newVote.save();
    // Update submission cache
    return res.status(200).json({ msg: 'Vote submitted successfully'})

  } catch (err){
    res.send(err);
  }
})
module.exports = router;
