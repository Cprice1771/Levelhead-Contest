const express = require('express');
const router = express.Router();
const Vote = require("../models/vote")
const Submission = require("../models/submission")


//@@ GET /api/votes
//@@ Displays all submitted votes
router.get('/', async (req, res) => {
  try {
    const votes = await Vote.find();
    res.send(votes);
  } catch(err){
    res.status(500).json({ msg: `${err}` });
  }
})

//@@ GET /api/votes/:contestId
//@@ Displays all submitted votes for a particular contest
router.get('/:contestId', async (req, res) => {
  try {
    const votes = await Vote.find({ contestId: req.params.contestId});
    res.send(votes);

  } catch(err){
    res.status(500).json({ msg: `${err}` });
  }
})

//@@ POST /api/votes
//@@ Votes for a new submission
router.post('/', async (req, res) => {
  try {
    let alreadyVoted = await Vote.find({$and:[{ discordId: req.body.discordId }, { contestId: req.body.contestId}]})
    if(alreadyVoted.length > 0){
      res.status(200).json({ msg: 'You have already voted in this contest.'})
    } else {
      let newVote = new Vote({
        submissionId: req.body.submissionId,
        contestId: req.body.contestId,
        discordId: req.body.discordId,
        dateVoted: req.body.dateVoted
      })
  
      let vote = await newVote.save();
      let update  = await Submission.findOneAndUpdate( {_id: req.body.submissionId}, {$push: {votes: vote._id}})
      res.status(200).json({ msg: 'Vote submitted successfully'})
    }
  } catch (err){
    res.status(500).json({ msg: `${err}` });
  }
})
module.exports = router;
