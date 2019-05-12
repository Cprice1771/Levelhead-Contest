const express = require('express');
const router = express.Router();
const Vote = require("../models/vote")
const Submission = require("../models/submission")
const Contest = require("../models/contest")
const moment = require('moment')

router.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

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
    var dateNow = new Date(Date.now());

    let alreadyVoted = await Vote.find({$and:[{ discordId: req.body.discordId }, { contestId: req.body.contestId}]})
    let contestInfo = await Contest.find({ _id: req.body.contestId})

    // if the vote is being cast in the valid contest window, execute vote
    if(dateNow < contestInfo[0].submissionEndDate) {
      res.status(422).json({ success: false, msg: `Voting for this contest doesn't begin until ${moment(contestInfo[0].submissionEndDate).format('MM/DD/YYYY')}`});
      return;
    } 

    if((dateNow > contestInfo[0].votingEndDate)) {
      res.status(422).json({ success: false, msg: `Voting for this contest ended on ${moment(contestInfo[0].votingEndDate).format('MM/DD/YYYY')}`});
      return;
    } 
    
    if((alreadyVoted.length >= contestInfo[0].maxVotePerUser)){
        res.status(422).json({ success: false, msg: `You can only vote ${contestInfo[0].maxVotePerUser} times in this contest.`});
        return;
    } 

    let newVote = new Vote({
      submissionId: req.body.submissionId,
      contestId: req.body.contestId,
      discordId: req.body.discordId,
      dateVoted: dateNow,
      submittedIp: req.connection.remoteAddress
    })
    let vote = await newVote.save();
    let update  = await Submission.findByIdAndUpdate(req.body.submissionId, {$push: {votes: vote.discordId}})
    res.status(200).json({ success: true, msg: `Vote submitted successfully. You have ${ contestInfo[0].maxVotePerUser - alreadyVoted.length - 1} votes remaining in this contest.`})
    
    
    } catch (err){
    res.status(500).json({ success: false, msg: `${err}` });
  }
})


//@@ POST /api/votes
//@@ Votes for a new submission
router.post('/remove', async (req, res) => {
  try {
    
    let contestInfo = await Contest.find({ _id: req.body.contestId});
    let dateNow = new Date();
    if(dateNow < contestInfo[0].submissionEndDate) {
      res.status(422).json({ success: false, msg: `Voting for this contest doesn't begin until ${moment(contestInfo[0].submissionEndDate).format('MM/DD/YYYY')}`});
      return;
    } 

    if((dateNow > contestInfo[0].votingEndDate)) {
      res.status(422).json({ success: false, msg: `Voting for this contest ended on ${moment(contestInfo[0].votingEndDate).format('MM/DD/YYYY')}`});
      return;
    } 
     

    var deleted = await Vote.deleteOne({ discordId: req.body.discordId, 
                  submissionId: req.body.submissionId,
                  contestId: req.body.contestId  });

    let update  = await Submission.findByIdAndUpdate(req.body.submissionId, {$pullAll: {votes: [req.body.discordId]}})
    
    
    let alreadyVoted = await Vote.find({$and:[{ discordId: req.body.discordId }, { contestId: req.body.contestId}]});
    res.status(200).json({ success: true, msg: `Vote removed successfully. You have ${ contestInfo[0].maxVotePerUser - alreadyVoted.length} votes remaining in this contest.`})
    
    
    } catch (err){
    res.status(500).json({ success: false, msg: `${err}` });
  }
})
module.exports = router;
