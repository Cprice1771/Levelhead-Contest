const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');
const btoa = require('btoa');
const Axios = require('axios');
const _ = require('lodash');
const moment = require('moment');


//Models
const LevelResult = require('../models/multiplayer/levelResult');
const Room = require('../models/multiplayer/room');
const RoomEntrants = require('../models/multiplayer/roomEntrant');

//Util
const RumpusAPI = require('../util/rumpusAPI');
const catchErrors = require('../util/catchErrors');
const MultiplayerHelpers = require('../util/MultiplayerHelpers');


router.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });
  


//@@ GET api/multiplayer/get-current-room
//@@ gets the current room
router.get('/get-current-room', catchErrors(async (req, res) => {
    let room = await Room.findOne();
    if(!room) {
        return res.status(400).json({
            success: false,
            data: `No room found`
        });
    }

    let entrants = await RoomEntrants.find({ roomId: room.roomId })
    room.entrants = entrants;
    res.status(200).json({
        success: true,
        data: room
    });
}));

router.post('/start-next-level', catchErrors(async (req, res) => {
    let room = await Room.findById(req.body.roomId);

    if(!room) {
        return res.status(400).json({
            success: false,
            data: `Invalid room ${req.body.roomId}`
        });
    }

    await MultiplayerHelpers.startLevelForRoom(room);

    res.status(200).json({
        success: true,
        data: room
    });
    //TODO: Alert clients the level has started
}));

router.post('/move-to-downtime', catchErrors(async (req, res) => {
    let room = await Room.findById(req.body.roomId);

    if(!room) {
        return res.status(400).json({
            success: false,
            data: `Invalid room ${req.body.roomId}`
        });
    }

    await MultiplayerHelpers.startDowntimeForRoom(room);

    res.status(200).json({
        success: true,
        data: room
    });
    //TODO: Alert clients the level has started
}));

//@@ POST api/multiplayer/join-room'
//@@ joins the current room
router.post('/join-room', catchErrors(async (req, res) => {
    let room = await Room.findById(req.body.roomId);

    if(!room) {
        res.status(400).json({
            success: false, 
            msg: `Invalid room ${req.body.roomId}`
        });
        return;
    }

    let entrants = await RoomEntrants.find({ "roomId": req.body.roomId  });
    if(entrants.length >= room.maxParticipants) {
        return res.status(400).json({
            success: false,
            msg: 'Room is full'
        });
    }

    if(!!_.find(entrants, x => x.userId == req.body.userId)) {
        return res.status(400).json({
            success: false,
            msg: 'User is already entered into this room'
        });
    }

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

    const entrant = new RoomEntrants({
        currentBestTime: null,
        userId: req.userId,
        rumpusId: '',
        rumpusAlias: ''
    });

    await entrant.save();
   
    res.status(200).json({
        success: true,
        data: room
    });
}));

//@@ GET api/multiplayer/get-current-room
//@@ leaves the room
router.get('/leave-room', catchErrors(async (req, res) => {
    await RoomEntrants.deleteOne({ $and : [{ "seasonId": req.body.seasonId  }, 
                                            { "userId": req.body.userId }]});
    res.status(200).json({
        success: true,
        msg: 'left room'
    });
}));



module.exports = router;