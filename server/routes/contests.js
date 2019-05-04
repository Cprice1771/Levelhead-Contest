const express = require('express');
const router = express.Router();
const Contest = require("../models/contest")

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
    endDate: req.body.endDate
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
