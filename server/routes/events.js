const express = require('express');
const router = express.Router();
const Contest = require("../models/contest");
const Season = require('../models/speedrun/season');
const ResponseStatus = require('../util/responseStatus');
const catchErrors = require('../util/catchErrors');


router.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

//@@ GET /api/contests/
//@@ Display all contests
router.get('/active', catchErrors(async function(req, res){
    const contests = await Contest.find({ votingEndDate: { $gt : new Date() }});
    const seasons = await Season.find({ endDate: { $gt : new Date() }});

    let events = [];
    events = events.concat(
        contests.map(x => { return {
            _id: x._id,
            startDate: x.startDate,
            endDate: x.votingEndDate,
            name: x.name,
            subtitle: x.theme,
            eventType: 'contest'
        }; }));

    events = events.concat(
        seasons.map(x => { return {
            _id: x._id,
            startDate: x.startDate,
            endDate: x.endDate,
            name: x.name,
            subtitle: x.seasonType === 'crowns' ? 'Crown Guild' : 'Speedrunners Guild',
            eventType: 'season'
        }; }));
    

    res.send(new ResponseStatus(true, '', events));
}));


module.exports = router;