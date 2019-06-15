const express = require('express');
const router = express.Router();
const User = require("../models/user");
const fetch = require('node-fetch');
const btoa = require('btoa');
const Axios = require('axios');
const Season = require('../models/speedrun/Season');
const RumpusAPI = require('../util/rumpusAPI');
const catchErrors = require('../util/catchErrors');


router.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });
  
router.post('/create', catchErrors(async (req, res) => {
    const newSeason = new Season({
        name: req.body.name,
        startDate: req.body.startDate,
        endDate: req.body.endDate,
        levelsInSeason: [],
        entries: [],
        });

    let season = await newSeason.save();

    res.status(200).json({
        success: true,
        data: season
    });

}));



router.post('/enroll', catchErrors(async (req, res) => {
    let user = User.findById(req.body.userId)
    if(!user.rumpusId) {
        if(!req.body.rumpusId) {

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
                    msg: `Hey it looks we don\'t have a rumpus id for you. 
                            Please enter your rumpus id so we can get your scores`
                });
                return;
            }

            user.rumpusId = req.body.rumpusId;
            await user.save();
            

        } else { 
            res.status(400).json({
                success: false, 
                msg: `Hey it looks we don\'t have a rumpus id for you. 
                        Please enter your rumpus id so we can get your scores`
            });
            return;
        }



    }

    res.status(200).json({
        success: true,
        data: season
    });
    
}));


router.get('/:id', catchErrors(async (req, res) => {
    const season = await Season.findById(req.params.id);
        res.status(200).json({
            success: true,
            data: season
        });
}));

router.get('/', catchErrors(async (req, res) => {

    const allSeasons = await Season.find();
    res.status(200).json({
        success: true,
        data: allSeasons
    });
   
}));

// router.get('/season', async (req, res) => {
//     try {
//         const allSeasons = Season.find();

//         res.status(200).json({
//             success: true,
//             data: allSeasons
//         });
//     } catch(err) {
//         res.status(500).json({
//             success: false, msg: err
//         });
//     }
// });
module.exports = router;