const express = require('express');
const router = express.Router();
const Contest = require("../models/contest");
const Submission = require('../models/submission');
const _ = require('lodash');
const Config = require('../models/config');
const Axios = require('axios');

const RumpusAPI = require('../util/rumpusAPI');
const User = require('../models/user')
const ResponseStatus = require('../util/responseStatus');
const moment = require('moment');
const catchErrors = require('../util/catchErrors');

const ContestHelpers = require('../util/ContestHelpers');

router.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

//@@ GET /api/contests/
//@@ Display all contests
router.get('/', catchErrors(async function(req, res){
  let contests = await Contest.find(); 
  res.send(contests);
}));

//@@ GET /active
//@@ gets active contests
router.get('/active', catchErrors(async function(req, res) {
  const contests = await Contest.find({ votingEndDate: { $gt : new Date() }});
  res.send(new ResponseStatus(true, '', contests));
}));

//@@ GET /update-results-cache/:contestId
//@@ updates the results cache for a given contest
router.get('/update-results-cache/:contestId', catchErrors(async function(req, res){
  const contest = await ContestHelpers.updateTopScores(req.params.contestId);
  res.send(contest);
}));


//@@ GET /api/results/results
//@@ get the results for a contest
router.get('/results/:contestId', catchErrors(async function(req, res){
  let submissions = await Submission.find({ contestId: req.params.contestId});
  let contest = await Contest.findById(req.params.contestId);
  if(submissions.length === 0) {
    res.send({ submissions: [], scores: [] });
  }

  submissions = _.orderBy(submissions, ['votes'], ['desc']);
  let scores= contest.topScores;

  res.send({ submissions, scores });
}));

//@@ GET /api/top-scores/:contestId
//@@ Get the top shoe and crown hunters for a contest
router.get('/top-scores/:contestId', catchErrors(async function(req, res){
  let submissions = await Submission.find({ contestId: req.params.contestId});
  if(submissions.length === 0) {
    res.send([]);
    return;
  }

  let contest = await Contest.findById(req.params.contestId);

  res.send(contest.topScores);
}));

//@@ GET /api/hand-out-awards
//@@ Get the top shoe and crown hunters for a contest
router.get('/hand-out-awards', catchErrors(async function(req, res){
  await ContestHelpers.handOutAwards();
  res.send({ success: true });
}));

//@@ GET /api/contests/:contestId
//@@ Display a specific contest
router.get('/:contestId', catchErrors(async function(req, res){
  let contest = await Contest.findById(req.params.contestId);
  if(!contest){
    res.status(404).json({msg: `Error Retrieving Contest ${req.params.contestId}.`})
  } else {
    res.send(contest);
  }
}));

//@@ GET /api/validate-levels'
//@@ validates if the given level ids exist within rumpus
router.post('/validate-levels', catchErrors(async function(req, res){
  const levels = await RumpusAPI.bulkGetLevels(req.body.levelIds);
  res.send({ success: true, data: levels});
}));

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
router.post('/', catchErrors(async function(req, res){
  //add new contest
  const newContest = new Contest({
    name: req.body.name,
    theme: req.body.theme,
    prizes: req.body.prizes,
    rules: req.body.rules,
    createdBy: req.body.createdBy,
    startDate: req.body.startDate || new Date(),
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
  if(user.role !== 'admin') {
    var existingContests = await Contest.find({ votingEndDate: { $gt: new Date() }});
    if(existingContests.length > 0) {
      res.status(422).json({ success: false, msg: `You can only have 1 contest running at a time! please wait until after ${moment(existingContests[0].votingEndDate).format('MM/DD/YYYY')} to create a new contest.`});
      return;
    }
  }

  //Validation
  var error = validateContest(req.body);
  if(error) {
    res.status(422).json(new ResponseStatus(false, error));
    return;
  }
  var levels = []
  if(newContest.contestType === 'speedrun') {
    levels = await RumpusAPI.bulkGetLevels(_.clone(req.body.contestLevels));
    if(levels.length !== req.body.contestLevels.length) {
      res.status(422).json(new ResponseStatus(false, 'Failed fetching level details, please ensure lookup codes are correct and try again.'));
      return;
    }
    
  }


  let contest = await newContest.save();

  if(newContest.contestType === 'speedrun') {
    for(var level of levels) {
      const newSubmission = new Submission({
        contestId: contest._id,
        dateSubmitted: new Date(),
          lookupCode: level.levelId,
        submittedByUserId: req.body.createdBy,
        rumpusCreatorId: level.userId,
        rumpusUserName: level.alias.alias,
        submittedIp: req.connection.remoteAddress,
        levelMetaData: level,
        overwrite: false
      });

      await newSubmission.save();
    }

    await ContestHelpers.updateTopScores(contest._id);
  }


  res.send({ success: true, msg : 'Contest Created', data: { _id: contest._id}});
  return;
  
}));


module.exports = router;
