const express = require('express');
const router = express.Router();
const Contest = require("../models/contest");
const Submission = require('../models/submission');
const _ = require('lodash');
const Config = require('../models/config');
const Axios = require('axios');

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


async function bulkGetLevels(levelIds) {
  let cfg = await Config.findOne();
  const httpClient = Axios.create({
    baseURL: 'https://www.bscotch.net/api/',  
    timeout: 5000,
    headers: {
      'rumpus-credentials' : cfg.key
    }
  });

  let newLevelData = [];
  while(levelIds.length > 0) {
    let toGet = levelIds.splice(0, Math.min(64, levelIds.length));
    let levelResults = (await httpClient.get(`storage/crates/lh-published-levels/items?names=${toGet.join(',')}&limit=64`)).data.data;
    newLevelData = newLevelData.concat(levelResults);
  }

  return newLevelData;
}

async function bulkGetUsers(users) {
  let cfg = await Config.findOne();
  const httpClient = Axios.create({
    baseURL: 'https://www.bscotch.net/api/',  
    timeout: 5000,
    headers: {
      'rumpus-credentials' : cfg.key
    }
  });

  let mappedUsers = [];
  while(users.length > 0) {
    let toGet = users.splice(0, Math.min(64, users.length));
    let userReuslt = (await httpClient.get(`aliases/contexts/levelhead/users?userIds=${toGet.join(',')}`)).data.data;
    mappedUsers = mappedUsers.concat(userReuslt);
  }

  return mappedUsers;
}

async function getTopScores(submissions) {
    let results = submissions.map(x => {
      return { Highscore: x.levelMetaData.records.HighScore[0].userId, 
                FastestTime: x.levelMetaData.records.FastestTime[0].userId
             }
    }).reduce( (acc, scores) => {

        var hsIndex = _.findIndex(acc, x => x.user === scores.Highscore);
        if(hsIndex < 0) {
          acc.push({
            highScores: 0,
            fastestTimes: 0,
            total: 0,
            user: scores.Highscore
          });
          hsIndex = acc.length - 1;
        }

        acc[hsIndex].highScores++;
        acc[hsIndex].total++;

        var timeIdx = _.findIndex(acc, x => x.user === scores.FastestTime);
        if(timeIdx < 0) {
          acc.push({
            highScores: 0,
            fastestTimes: 0,
            total: 0,
            user: scores.FastestTime
          });
          timeIdx = acc.length - 1;
        }

        acc[timeIdx].fastestTimes++;
        acc[timeIdx].total++;


        return acc;

    }, []);


    results = _.orderBy(results, ['total'], ['desc']);
    results = results.splice(0, 10);

    let usersToGet = _.map(results, x => x.user);
    let users = await bulkGetUsers(usersToGet);
    for(var i = 0; i < results.length; i++) {
      let foundMap = _.find(users, x => x.userId === results[i].user);
      if(!!foundMap) {
        results[i].rumpusName = foundMap.alias;
      }
    }

    return results;
}

router.get('/update-results-cache/:contestId', async function(req, res){

  try {
    let contest = await Contest.findById(req.params.contestId);
    let submissions = await Submission.find({ contestId: req.params.contestId});

    if(submissions.length === 0){
      res.send(contest);
      return;
    }

    let levelIds = _.map(submissions, x => x.lookupCode);
    levels = await bulkGetLevels(levelIds);

    for(var i = 0; i < submissions.length; i++) {
      let foundLevel = _.find(levels, x => x.name === submissions[i].lookupCode);
      if(!!foundLevel) {
        submissions[i].levelMetaData = foundLevel;
      }
    }

    for(var submission of submissions){
      await submission.save();
    }
    

    let scores = await getTopScores(submissions);
    contest.topScores = scores;
    await contest.save();

  res.send(contest);
  }
  catch (err) {
    res.status(500).json({msg: `Error Retrieving Contest ${req.params.contestId}.`})
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
