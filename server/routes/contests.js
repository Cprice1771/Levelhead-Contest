const express = require('express');
const router = express.Router();
const Contest = require("../models/contest");
const Submission = require('../models/submission');
const _ = require('lodash');
const Config = require('../models/config');
const Axios = require('axios');
const RumpusAPI = require('../uitl/rumpusAPI');


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


//@@ POST /api/contests
//@@ Creates a new contest
router.post('/', function(req, res){
  //add new contest
  const newContest = new Contest({
    name: req.body.name,
    theme: req.body.theme,
    prizes: req.body.prizes,
    rules: req.body.rules,
    startDate: req.body.startDate,
    submissionEndDate: req.body.submissionEndDate,
    votingEndDate: req.body.votingEndDate
  });
  newContest.save(function(err, contest){
    if(err){
      res.status(500).json({ msg: `${err}`})
    } else {
      res.send(contest);
    }
  })
})


module.exports = router;
