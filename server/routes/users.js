const express = require('express');
const router = express.Router();
const User = require("../models/user");

router.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });
  


router.get('/discord-auth', async(req, res) => {
    res
    .status(200)
    .json({ link: 'https://discordapp.com/api/oauth2/authorize?client_id=574425968303669259&redirect_uri=https%3A%2F%2Flevelcup.herokuapp.com&response_type=code&scope=identify' });
})


//@@ GET /api/users/:discordId
//@@ get user info
router.get('/:discordId', async (req, res) => {
    try {
        let user = await Users.findOne({$and:[{ discordId: req.body.discordId}]});

        if(!!user) {
            res.status(200).json({
                success: true,
                data: user
            });
        } else {
            res.status(404).json({
                success: false
            });
        }
    } catch(err) {
        res.status(500).json({
            success: false, msg: err
        });
    }
});

//@@ POST /api/users/
//@@ create user
router.post('/', async (req, res) => {
    try {
        const newUser = new User({
            discordId: req.body.discordId,
            discordDisplayName: null,
            rumpusId: null,
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