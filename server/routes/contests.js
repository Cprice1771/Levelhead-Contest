const express = require('express');
const router = express.Router();
const Contest = require("../models/contest");
const Submission = require('../models/submission');
const _ = require('lodash');
const Config = require('../models/config');
const Axios = require('axios');
const RumpusAPI = require('../uitl/rumpusAPI');
const User = require('../models/user')
const ResponseStatus = require('../uitl/responseStatus');

router.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

//@@ GET /api/contests/
//@@ Display all contests
router.get('/', function(req, res){
  Contest.find(function(err, contests){
    if(err){
      res.status(404).json({msg: "Error Retrieving Contests."})
    } else {
      res.send(contests);
    }
  })
});

router.get('/update-results-cache/:contestId', async function(req, res){

  try {
    const rapi = new RumpusAPI();
    const contest = await rapi.updateTopScores(req.params.contestId);
    res.send(contest);
  }
  catch (err) {
    res.status(500).json({msg: `Error Retrieving Contest ${req.params.contestId}. ${err}`})
  }
});


//@@ GET /api/contests/results
//@@ Display all submissions
router.get('/results/:contestId', async function(req, res){
  try {
    
    let submissions = await Submission.find({ contestId: req.params.contestId});
    let contest = await Contest.findById(req.params.contestId);
    if(submissions.length === 0) {
      res.send({ submissions: [], scores: [] });
    }

    submissions = _.orderBy(submissions, ['votes'], ['desc']);
    let scores= contest.topScores;

    res.send({ submissions, scores });

  } catch (err) {
    res.status(500).json({msg: err})
  }
})

//@@ GET /api/contests/results
//@@ Display all submissions
router.get('/top-scores/:contestId', async function(req, res){
  try {
      
    let submissions = await Submission.find({ contestId: req.params.contestId});
    if(submissions.length === 0) {
      res.send([]);
    }

    let contest = await Contest.findById(req.params.contestId);

    res.send(contest.topScores);

  } catch (err) {
    res.status(500).json({msg: "Error Retrieving Submissions."})
  }
})

//@@ GET /api/contests/:contestId
//@@ Display a specific contest
router.get('/:contestId', function(req, res){
  Contest.findById(req.params.contestId, function(err, contest){
    if(err){
      res.status(404).json({msg: `Error Retrieving Contest ${req.params.contestId}.`})
    } else {
      res.send(contest);
    }
  })
})

function validateContest(contest) {


  if(!contest.name || !contest.theme || !contest.rules) {
    return 'Missing contest info';
  }

  if(contest.startDate > contest.submissionEndDate || 
    contest.submissionEndDate > contest.votingEndDate) {
        return 'Invalid contest dates';
  }

  if(['building', 'speedrun'].indexOf(contest.contestType) === -1) {
    return 'Invalid contest type';
  }

  if(contest.contestType === 'speedrun') {
    if(!contest.countShoes && !contest.countCrowns) {
      return 'Speed run contests must be for shoes or crowns or both';
    }
  }

  if(contest.contestType === 'building') {
    if(contest.maxVotePerUser <= 0) {
      return 'Building contests must allow for at least 1 vote per user';
    }
  }

  return null;
}

//@@ POST /api/contests
//@@ Creates a new contest
router.post('/', async function(req, res){
  //add new contest
  const newContest = new Contest({
    name: req.body.name,
    theme: req.body.theme,
    prizes: req.body.prizes,
    rules: req.body.rules,
    createdBy: req.body.createdBy,
    startDate: req.body.startDate,
    submissionEndDate: req.body.submissionEndDate,
    votingEndDate: req.body.votingEndDate,
    /*Contest Type */
    contestType: req.body.contestType,
    /*Speedrun Contest Rules */
    countCrowns: req.body.countCrowns,
    countShoes: req.body.countShoes,
    /*Builder Contest Rules */
    maxVotePerUser: req.body.maxVotePerUser,
    displayTopScore: req.body.displayTopScore,
    allowPreviousLevels: req.body.allowPreviousLevels,
    requireDailyBuild: req.body.requireDailyBuild,
    requireLevelInTower: req.body.requireLevelInTower,
    canVoteForSelf: req.body.canVoteForSelf,
  });

  var user = await User.findById(req.body.createdBy);
  if(user.role != 'Admin') {
    var existingContests = await Contest.find({ votingEndDate: { $gt: new Date() }});
    if(existingContests.length > 0) {
      res.status(422).json({ success: false, msg: `You can only have 1 contest running at a time! please wait until after ${moment(existingContests[0].votingEndDate).format('MM/DD/YYYY')} to create a new contest.`});
    }
  }

  //Validation
  var error = validateContest(newContest);
  if(error) {
    res.status(422).json(new ResponseStatus(false, error));
  }

  

  if(['building', 'speedrun'].indexOf(newContest.contestType) === -1) {
    res.status(422).json(new ResponseStatus(false, 'Invalid contest type'));
  }

  newContest.save(function(err, contest){
    if(err){
      res.status(500).json({ success: false, msg: `${err}`})
    } else {
      res.send({ success: true, msg : 'Contest Created'});
    }
  })
})


module.exports = router;
