const express = require('express');
const router = express.Router();
const User = require("../models/user");
const fetch = require('node-fetch');
const btoa = require('btoa');
const Axios = require('axios');
const _ = require('lodash');

const RumpusAPI = require('../util/rumpusAPI');
const Season = require('../models/Speedrun/Season');
const catchErrors = require('../util/catchErrors');
const SeasonHelpers = require('../util/SeasonHelpers');
const UserScores = require('../models/Speedrun/userScore')
router.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });
  


//@@ POST api/seasons/get-user-scores
//@@ gets user scores
router.post('/get-user-scores', catchErrors(async (req, res) => {
    // console.log(req.body)
    let scores = await UserScores.find({ $and : [{ "seasonId": req.body.seasonId  }, { "userId": req.body.userId }]});
   
    res.status(200).json({
        success: true,
        data: scores
    });
}));

//@@ GET /api/seasons/hand-out-awards
//@@ Get the top shoe and crown hunters for a contest
router.get('/hand-out-awards', catchErrors(async function(req, res){
    await SeasonHelpers.handOutAllAwards();
    res.send({ success: true });
  }));

//@@ POST api/seasons/get-level-scores
//@@ gets a levels scores
router.post('/get-level-scores', catchErrors(async (req, res) => {
    let scores = await UserScores.find({ $and : [{ "seasonId": req.body.seasonId  }, { "levelLookupCode": req.body.levelId }]});
   
    res.status(200).json({
        success: true,
        data: scores
    });
}));



//@@ POST api/seasons/create
//@@ Create a new season
router.post('/create', catchErrors(async (req, res) => {
    var user = await User.findById(req.body.createdBy);
    if(['admin', 'season-moderator'].indexOf(user.role) === -1) {
        res.status(422).json({ success: false, msg: `You do not have permission to create a new season`});
        return;
    }

    var existingSeason = await Season.find({ $and : [{ "endDate": {"$gte": new Date()} }, 
                                                     { "seasonType": req.body.seasonType }]});

    if(existingSeason.length > 0) {
        res.status(400).json({
            success: false,
            msg: 'Cannot add a season until the current one ends'
        });
        return;
    }

    const newSeason = new Season({
        name: req.body.name,
        startDate: req.body.startDate,
        endDate: req.body.endDate,
        seasonType: req.body.seasonType,
        levelsInSeason: [],
        entries: [],
        });


    let users = await SeasonHelpers.getPlayersForNextSeason(req.body.seasonType);
    newSeason.entries = users;

    let saved = await newSeason.save();

    res.status(200).json({
        success: true,
        data: saved
    });

}));

//@@ POST api/seasons/suggest-levels
//@@ suggests levels for speedrunner guild
router.get('/suggest-levels', catchErrors(async (req, res) => {
   let levels = await SeasonHelpers.getRecommendations();
    res.status(200).json({
        success: true,
        levels: levels
    });

}));

//@@ POST api/seasons/update-leaderboard/:seasonId
//@@ Create a new season
router.get('/update-leaderboard/:seasonId', catchErrors(async (req, res) => {
    await SeasonHelpers.updateSeasonLeaderboard(req.params.seasonId)
    res.status(200).json({
        success: true
    });

}));

//@@ POST api/seasons/enroll
//@@ Enroll yourself in a new season
router.post('/enroll', catchErrors(async (req, res) => {
    let user = await User.findById(req.body.userId)
    if(!user.rumpusId) {
        if(!!req.body.rumpusId) {

            let existingUsers = await User.find({ rumpusId: req.body.rumpusId });
            if(existingUsers.length > 0) {
                res.status(400).json({
                    success: false, 
                    msg: `That rumpus user already has an account registered! 
                        If you think this is incorrect please contact us to get this resolved.`
                });
                return;
            }

            let foundUser = await RumpusAPI.getUser(req.body.rumpusId);
            if(!foundUser) {
                res.status(400).json({
                    success: false, 
                    getRumpusId: true,
                    msg: `Hey it looks we don\'t have a rumpus id for you. 
                            Please enter your rumpus id so we can get your scores`
                });
                return;
            }

            user.rumpusId = req.body.rumpusId;
            user.rumpusAlias = foundUser.alias;
            await user.save();
            

        } else { 
            res.status(400).json({
                success: false, 
                msg: `It looks we don\'t have a rumpus id for you. 
                        Please enter your rumpus id so we can get your scores`
            });
            return;
        }
    }

    if(!user.rumpusAlias) {
        let foundUser = await RumpusAPI.getUser(user.rumpusId);
            if(!foundUser) {
                res.status(400).json({
                    success: false, 
                    getRumpusId: true,
                    msg: `Hey it looks we don\'t have a rumpus id for you. 
                            Please enter your rumpus id so we can get your scores`
                });
                return;
            }

            user.rumpusAlias = foundUser.alias;
            await user.save();
    }

    let curSeason = await Season.findById(req.body.seasonId);

    if(_.find(curSeason.entries, x => x.userId === req.body.userId)) {
        res.status(400).json({
            success: false, 
            msg: `You are already enrolled in this season!`
        });
        return;
    }

    curSeason.entries.push({
        userId: req.body.userId,
        rumpusId: user.rumpusId,
        rumpusAlias: user.rumpusAlias,
        diamonds: 0,
        platinums: 0,
        golds: 0,
        silvers: 0,
        bronzes: 0,
        totalPoints: 0,
        timesSubmitted: 0,
        league: 2, //Enroll into Jem for now
    });
    await curSeason.save();

    SeasonHelpers.updateSeasonLeaderboard(curSeason._id);

    res.status(200).json({
        success: true,
        data: curSeason
    });
    
}));

//@@ POST api/seasons/set-league
//@@ sets a users league
router.post('/set-league', catchErrors(async (req, res) => {
    let foundSeason = await Season.findById(req.body.seasonId);
    if(!foundSeason) {
        res.status(400).json({
            success: false,
            msg: 'Season not found'
        });
        return;
    }


    var userIndex = foundSeason.entries.findIndex(x => x.userId === req.body.userId);
    if(userIndex < 0) {
        res.status(400).json({
            success: false,
            msg: 'Could not find user in season'
        });
        return;
    }
    foundSeason.entries[userIndex].league = req.body.newLeague;
    await foundSeason.save();
    res.status(200).json({
        success: true,
        data: foundSeason
    });
}));



//@@ POST api/seasons/add-level
//@@ add a level to a season
router.post('/add-level', catchErrors(async (req, res) => {
    let foundSeason = await Season.findById(req.body.seasonId);
    if(!foundSeason) {
        res.status(400).json({
            success: false,
            msg: `Could not find season ${req.body.seasonId}`
        });
        return;
    }


    var levelIndex = _.findIndex(foundSeason.levelsInSeason, x => x.lookupCode === req.body.lookupCode);
    if(levelIndex >= 0) {
        res.status(400).json({
            success: false,
            msg: 'This level already exists in this season!'
        });
        return;
    }

    let level = await RumpusAPI.getLevel(req.body.lookupCode);
    foundSeason.levelsInSeason.push({ 
        levelName: level.title,
        creatorAlias: level.alias.alias,
        lookupCode: req.body.lookupCode,
        bonusAward: req.body.bonusAward,
        diamondValue: req.body.diamondValue,
        platinumValue: req.body.platinumValue,
        goldValue: req.body.goldValue,
        silverValue: req.body.silverValue,
        bronzeValue: req.body.bronzeValue,
        addedBy: req.body.addedBy,
        startDate: req.body.startDate || new Date()
    });
    await foundSeason.save();

    SeasonHelpers.updateSeasonLeaderboard(req.body.seasonId);

    res.status(200).json({
        success: true,
        data: foundSeason
    });
}));

//@@ post api/seasons/edit-level
//@@ update a level in a season
router.post('/edit-level', catchErrors(async (req, res) => {
    let foundSeason = await Season.findById(req.body.seasonId);
    if(!foundSeason) {
        res.status(400).json({
            success: false,
            msg: `Could not find season ${req.body.seasonId}`
        });
        return;
    }

    //console.log(foundSeason.levelsInSeason);
    var levelIndex = _.findIndex(foundSeason.levelsInSeason, x => x.lookupCode === req.body.lookupCode);
    if(levelIndex < 0) {
        res.status(400).json({
            success: false,
            msg: 'Could not find level'
        });
        return;
    }

    let level = await RumpusAPI.getLevel(req.body.lookupCode);

    if(!level) {
        res.status(400).json({
            success: false,
            msg: `Level ${req.body.lookupCode} does not exist in levelhead`
        });
        return;
    }

    if(foundSeason.levelsInSeason[levelIndex].startDate < new Date()) {
        res.status(400).json({
            success: false,
            msg: 'Cannot edit level that has already started'
        });
        return;
    }

    foundSeason.levelsInSeason[levelIndex].levelName = level.title;
    foundSeason.levelsInSeason[levelIndex].creatorAlias = level.alias.alias;
    foundSeason.levelsInSeason[levelIndex].lookupCode = req.body.lookupCode;
    foundSeason.levelsInSeason[levelIndex].bonusAward = req.body.bonusAward;
    foundSeason.levelsInSeason[levelIndex].diamondValue = req.body.diamondValue;
    foundSeason.levelsInSeason[levelIndex].platinumValue = req.body.platinumValue;
    foundSeason.levelsInSeason[levelIndex].goldValue = req.body.goldValue;
    foundSeason.levelsInSeason[levelIndex].silverValue = req.body.silverValue;
    foundSeason.levelsInSeason[levelIndex].bronzeValue = req.body.bronzeValue;
    foundSeason.levelsInSeason[levelIndex].addedBy = req.body.addedBy;
    foundSeason.levelsInSeason[levelIndex].startDate = req.body.startDate || new Date()
    
    await foundSeason.save();

    SeasonHelpers.updateSeasonLeaderboard(req.body.seasonId);

    res.status(200).json({
        success: true,
        data: foundSeason
    });
}));

//@@ post api/seasons/delete-level
//@@ deletes a level from a a season
router.post('/delete-level', catchErrors(async (req, res) => {
    let foundSeason = await Season.findById(req.body.seasonId);
    if(!foundSeason) {
        res.status(400).json({
            success: false,
            msg: `Could not find season ${req.body.seasonId}`
        });
        return;
    }


    var levelIndex = _.findIndex(foundSeason.levelsInSeason, x => x.lookupCode === req.body.lookupCode);
    if(levelIndex < 0) {
        res.status(400).json({
            success: false,
            msg: 'Could not find level'
        });
        return;
    }

    if(foundSeason.levelsInSeason[levelIndex].startDate < new Date()) {
        res.status(400).json({
            success: false,
            msg: 'Cannot delete level that has already started'
        });
        return;
    }

    foundSeason.levelsInSeason.splice(levelIndex, 1);
    
    await foundSeason.save();

    SeasonHelpers.updateSeasonLeaderboard(req.body.seasonId);

    res.status(200).json({
        success: true,
        data: foundSeason
    });
}));

//@@ GET api/seasons/:id
//@@ gets a season by id
router.get('/:id', catchErrors(async (req, res) => {
    let foundSeason = await Season.findById(req.params.id);
    res.status(200).json({
        success: true,
        data: foundSeason
    });
}));

//@@ GET api/seasons/
//@@ get all seasons
router.get('/', catchErrors(async (req, res) => {
    let allSeasons = await Season.find();
    res.status(200).json({
        success: true,
        data: allSeasons
    });
   
}));

module.exports = router;