const express = require('express');
const router = express.Router();
const User = require("../models/user");
const fetch = require('node-fetch');
const btoa = require('btoa');
const Axios = require('axios');

router.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });
  

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;

router.post('/discord-auth', async(req, res) => {


    res.status(200).json({
        success: true,
        link: `https://discordapp.com/oauth2/authorize?client_id=${CLIENT_ID}&scope=identify&response_type=token&redirect_uri=${encodeURIComponent(req.body.redirect)}`
    });
});

router.post('/login', async (req, res) => {
    try {


        const httpClient = Axios.create({
            baseURL: 'https://discordapp.com/api/',  
            timeout: 5000,
            headers : {
                authorization: `${req.body.tokenType} ${req.body.accessToken}`
            }
          });

        const response = (await httpClient.get(`users/@me`)).data;

        const { username, discriminator } = response;

        var user = await User.findOne({$and:[{ discordId: `${username}#${discriminator}`}]});
        if(!user) {
            const newUser = new User({
                discordId: `${username}#${discriminator}`,
                discordDisplayName: username,
                rumpusId: null,
                dateRegistered: new Date(),
              });
    
            user = await newUser.save();
        }
        

        res.status(200).json({
            success: true,
            user: user
        });
        
        
    } catch (err) {
        res.status(500).json({
            success: false, msg: err
        });
    }
  });


//@@ put /api/users/:userId
//@@ update user
router.put('/:userId', async (req, res) => {
    try {
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
    } catch(err) {
        res.status(500).json({
            success: false, msg: err
        });
    }
});
module.exports = router;