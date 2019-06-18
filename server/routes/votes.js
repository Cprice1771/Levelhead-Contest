const express = require('express');
const router = express.Router();
const Vote = require("../models/vote")
const Submission = require("../models/submission")
const Contest = require("../models/contest")
const moment = require('moment');
const catchErrors = require('../util/catchErrors');

router.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

//@@ GET /api/votes
//@@ Displays all submitted votes
router.get('/:contestId/:userId', catchErrors(async (req, res) => {
  const votes = await Vote.find({$and:[{ userId: req.params.userId }, { contestId: req.params.contestId}]});
  res.send({ success: true, data: votes});
}));

//@@ GET /api/votes/:contestId
//@@ Displays all submitted votes for a particular contest
router.get('/:contestId', catchErrors(async (req, res) => {
  const votes = await Vote.find({ contestId: req.params.contestId});
  res.send(votes);
}));

//@@ POST /api/votes/
//@@ Vote for a submission
router.post('/', catchErrors(async (req, res) => {
  var dateNow = new Date(Date.now());

  let alreadyVoted = await Vote.find({$and:[{ userId: req.body.userId }, { contestId: req.body.contestId}]})
  let contestInfo = await Contest.findById(req.body.contestId);

  // if the vote is being cast in the valid contest window, execute vote
  if(dateNow < contestInfo.submissionEndDate) {
    res.status(422).json({ success: false, msg: `Voting for this contest doesn't begin until ${moment(contestInfo.submissionEndDate).format('MM/DD/YYYY')}`});
    return;
  } 

  if((dateNow > contestInfo.votingEndDate)) {
    res.status(422).json({ success: false, msg: `Voting for this contest ended on ${moment(contestInfo.votingEndDate).format('MM/DD/YYYY')}`});
    return;
  } 
  
  if((alreadyVoted.length >= contestInfo.maxVotePerUser)){
      res.status(422).json({ success: false, msg: `You can only vote ${contestInfo.maxVotePerUser} times in this contest.`});
      return;
  } 

  if(!contestInfo.canVoteForSelf) {
    let voteFor = await Submission.findById(req.body.submissionId);
    if(voteFor.submittedByUserId === req.body.userId) {
      res.status(422).json({ success: false, msg: `You can't vote for your own levels in this contest!`});
      return;
    }
  }

  let newVote = new Vote({
    submissionId: req.body.submissionId,
    contestId: req.body.contestId,
    userId: req.body.userId,
    dateVoted: dateNow,
    submittedIp: req.connection.remoteAddress
  })
  let vote = await newVote.save();
  let update  = await Submission.findByIdAndUpdate(req.body.submissionId, {$inc: {votes: 1}})
  res.status(200).json({ success: true, msg: `Vote submitted successfully. You have ${ contestInfo.maxVotePerUser - alreadyVoted.length - 1} votes remaining in this contest.`});
}));


//@@ POST /api/remove
//@@ remove your vote for a submission
router.post('/remove', catchErrors(async (req, res) => {
  let contestInfo = await Contest.findById(req.body.contestId);
  let dateNow = new Date();
  if(dateNow < contestInfo.submissionEndDate) {
    res.status(422).json({ success: false, msg: `Voting for this contest doesn't begin until ${moment(contestInfo.submissionEndDate).format('MM/DD/YYYY')}`});
    return;
  } 

  if((dateNow > contestInfo.votingEndDate)) {
    res.status(422).json({ success: false, msg: `Voting for this contest ended on ${moment(contestInfo.votingEndDate).format('MM/DD/YYYY')}`});
    return;
  } 
    

  var vote = await await Vote.findOne({$and:[{ userId: req.body.userId }, { contestId: req.body.contestId}, { submissionId: req.body.submissionId }]});
  if(!vote) {
    res.status(200).json({ 
      success: false, 
      msg: `You haven't voted for that.`})
    return
  }


  var deleted = await Vote.deleteOne({ userId: req.body.userId, 
                submissionId: req.body.submissionId,
                contestId: req.body.contestId  });

  let update  = await Submission.findByIdAndUpdate(req.body.submissionId, {$inc: {votes: -1}})
  
  
  let alreadyVoted = await Vote.find({$and:[{ userId: req.body.userId }, { contestId: req.body.contestId}]});
  res.status(200).json({ success: true, msg: `Vote removed successfully. You have ${ contestInfo.maxVotePerUser - alreadyVoted.length} votes remaining in this contest.`})
  
}));
module.exports = router;
