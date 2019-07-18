const express = require('express');
const router = express.Router();
const User = require("../models/user");
const fetch = require('node-fetch');
const btoa = require('btoa');
const Axios = require('axios');
const RumpusAPI = require('../util/rumpusAPI');
const catchErrors = require('../util/catchErrors');
const UserAwards = require('../models/userAward');

router.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});
  
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;

//@@ POST /discord-auth
//@@ Gets the discord oauth2 url to login with
router.post('/discord-auth', catchErrors(async(req, res) => {
    res.status(200).json({
        success: true,
        link: `https://discordapp.com/oauth2/authorize?client_id=${CLIENT_ID}&scope=identify&response_type=token&redirect_uri=${encodeURIComponent(req.body.redirect)}`
    });
}));

//@@ GET /awards:id
//@@ Gets a users awards
router.get('/awards/:userId', catchErrors(async (req, res) => {

    let awards = await UserAwards.find({  userId: req.params.userId });
    res.status(200).json({
        success: true,
        data: awards
    });
}));


//@@ POST /update-key/:id
//@@ updates a users delegation key
router.post('/update-key/:id', catchErrors(async (req, res) => {
    let user = await User.findById(req.params.id);
    if(!user) {
        res.status(404).json({
            success: false, msg: 'User not found'
        });
        return;
    } 
    user.apiKey = req.body.apiKey;
    

    if(!!req.body.apiKey) {
        try {
            var keyInfo = await RumpusAPI.DelegationKeyPermissions(req.body.apiKey);
            user.rumpusId = keyInfo.userId;
            user.keyPermissions = keyInfo.permissions;

            var userInfo = await RumpusAPI.getUser(keyInfo.userId);
            user.rumpusAlias = userInfo.alias;


        } catch(err) {
            res.status(400).json({
                success: false,
                msg: 'Invalid Key'
            });
        }
    } else {
        user.keyPermissions = null;
    }
    
    await user.save();
    res.status(200).json({
        success: true,
        data: user
    });
}));

//@@ POST api/login
//@@ Login with a given discord auth token
router.post('/login', catchErrors(async (req, res) => {
    const httpClient = Axios.create({
        baseURL: 'https://discordapp.com/api/',  
        timeout: 5000,
        headers : {
            authorization: `${req.body.tokenType} ${req.body.accessToken}`
        }
    });

    const response = (await httpClient.get(`users/@me`)).data;
    const { username, discriminator, id } = response;

    var user = await User.findOne({$and:[{ discordUniqueId: id}]});
    //Dumb legacy method to catch people created before I stored discord unique ids
    //TODO: delete me after contest ends 
    if(!user) {
        user = await User.findOne({$and:[{ discordId: `${username}#${discriminator}`}]});
    }

    if(!user) {
        const newUser = new User({
            discordUniqueId: id, 
            discordId: `${username}#${discriminator}`,
            discordDisplayName: username,
            rumpusId: null,
            dateRegistered: new Date(),
            });

        user = await newUser.save();
    } else {
        user.discordUniqueId = id;
        user.save();
    }
    

    res.status(200).json({
        success: true,
        user: user
    });
}));


//@@ put /api/users/:userId
//@@ update user
router.put('/:userId', catchErrors(async (req, res) => {
    const newUser = new User({
        discordId: req.body.discordId,
        discordDisplayName: req.body.rumpusId,
        rumpusId: req.body.rumpusId,
        discordAccessToken: null,
        dateRegistered: new Date(),
        });

    let user = await newUser.save();

    res.status(200).json({
        success: true,
        data: user
    });
   
}));
module.exports = router;