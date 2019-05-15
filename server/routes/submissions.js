const express = require('express');
const router = express.Router();
const Submission = require("../models/submission")
const Contest = require('../models/contest');
const Axios = require('axios');
const User = require('../models/user');
const rumpusConfig = require('../models/rumpusConfig');
const httpClient = Axios.create({
  baseURL: 'https://www.bscotch.net/api/',  
  timeout: 5000,
})

router.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

var saveSubmission = (newSubmission, res) => {
  newSubmission.save().then(sub => {
      res.status(200).json({
        success: true,
        msg: "Submission successfully entered.",
        data: sub
      });
  }).catch(err => {
    res.status(500).json({ msg: `${err}`})
  });

}

//@@ GET /api/submissions/
//@@ Display all submissions
router.get('/', function(req, res){
  Submission.find(function(err, submissions){
    if(err){
      res.status(404).json({msg: "Error Retrieving Submissions."})
    } else {
      res.send(submissions);
    }
  })
})

//@@ GET /api/submissions/:contestId
//@@ Display submissions belonging to a certain contest
router.get('/:contestId', function(req, res){
  Submission.find({ contestId: req.params.contestId}, function(err, submissions){
    if(err){
      res.status(404).json({msg: `Error Retrieving Submission ${req.params.contestId}.`})
    } else {
      res.send(submissions);
    }
  })
})

//@@ GET /api/submissions/:contestId
//@@ Display submissions belonging to a certain contest
router.get('leaders/:contestId', function(req, res){
  Submission.find({ contestId: req.params.contestId}, function(err, submissions){
    if(err){
      res.status(404).json({msg: `Error Retrieving Submission ${req.params.contestId}.`})
    } else {
      res.send(submissions);
    }
  })
})

// @@ POST /api/submissions
// @@ Creates a new level submission
router.post('/', async function(req, res){
  const newSubmission = new Submission({
    contestId: req.body.contestId,
    dateSubmitted: new Date(),
    lookupCode: req.body.lookupCode,
    submittedByUserId: req.body.submittedByUserId,
    overwrite: req.body.overwrite,
    rumpusCreatorId: '123456',
    rumpusUserName: null,
    submittedIp: req.connection.remoteAddress,
    votes: 0,
  });


  try {

    let contestInfo = await Contest.find({ _id: req.body.contestId})
    let dateNow = new Date();
    
    if(dateNow < contestInfo[0].startDate) {
      res.status(422).json({ success: false, msg: `Submission aren't accepted until ${moment(contestInfo[0].startDate).format('MM/DD/YYYY')}`});
      return;
    } 

    if(dateNow > contestInfo[0].submissionEndDate) {
      res.status(422).json({ success: false, msg: `Submissions ended on ${moment(contestInfo[0].submissionEndDate).format('MM/DD/YYYY')}`});
      return;
    } 


      //Validate level hasn't already been submitted
      let existingSubmissions = await Submission.find( {$and:[{ lookupCode: req.body.lookupCode }, { contestId: req.body.contestId }]});
      if(existingSubmissions.length > 0) {
        res.status(200).json({
          success: false,
          msg: `This level code has already been submitted to this contest.`,
          submissionId: `${existingSubmissions[0]._id} `,
          submittedBy: existingSubmissions[0].submittedByUserId
        });
        return;
      }


      let config = await rumpusConfig.find();
      httpClient.headers = {
        'rumpus-credentials' : '5ccf2752555eae00bbfca8ca-SWwG8EKfPSm7sE8T'
      };
      //Validate level is real with rumpus
      let levelResult = (await httpClient.get(`storage/crates/lh-published-levels/items?names=${req.body.lookupCode}&limit=1`)).data.data[0]; //don't ask....

      if(!levelResult) {
        res.status(200).json({ 
          success: false,
          msg: 'Lookup code not found in rumpus. Be careful, they are case sensitive!'});
        return;
      }

      if(new Date(levelResult.createdAt) < new Date(contestInfo[0].startDate)) {
        res.status(200).json({ 
          success: false,
          msg: 'Cannot submit levels created before the contest began.'});
        return;
      }

      let userReuslt = (await httpClient.get(`aliases/contexts/levelhead/users?userIds=${levelResult.userId}`)).data.data[0]; //don't ask....

      newSubmission.rumpusUserName = userReuslt.alias;
      newSubmission.rumpusCreatorId = levelResult.userId;
      newSubmission.levelMetaData = levelResult;


      let existingRumpusUser = await User.find( {$and:[{ rumpusId: newSubmission.rumpusCreatorId}]});
      if(existingRumpusUser.length > 0 && 
        existingRumpusUser[0]._id != newSubmission.submittedByUserId) {
          res.status(200).json({ 
            success: false,
            msg: 'Another user has already claimed this rumpus user. If you are the owner of this rumpus account please contact us to verify.'});
          return;

      }

      let existingUser = await User.findById(newSubmission.submittedByUserId)

      if(!existingUser.rumpusId) {
        existingUser.rumpusId = levelResult.userId;
        await existingUser.save();
      } else if(existingUser.rumpusId !== levelResult.userId) {
        res.status(200).json({ 
          success: false,
          msg: 'Your account is not linked to this rumpus user, if you think this is in error please contact us.'});
        return;
      }

      
      //Validate if user has already submitted a level
      let existingUserSubmissions = await Submission.find( {$and:[{ submittedByUserId: newSubmission.submittedByUserId}, { contestId: req.body.contestId}]});

      if(existingUserSubmissions.length > 0 && !req.body.overwrite) {
        res.status(200).json({ 
          success: false,
          requiresOverwrite: true,
          msg: 'You have already submitted a level to this contest, are you sure you wish to overwrite that submission with this one?'});
        return;
      }
      
      //if the user had an existing submission update it
      if(existingUserSubmissions.length > 0) {
        let data = await Submission.updateOne({_id: existingUserSubmissions[0]._id}, 
          {
          contestId: req.body.contestId,
          dateSubmitted: new Date(),
          lookupCode: req.body.lookupCode,
          submittedByUserId: req.body.submittedByUserId,
          overwrite: req.body.overwrite,
          rumpusCreatorId: levelResult.userId,
          rumpusUserName: userReuslt.alias,
          levelMetaData: levelResult,
          submittedIp: req.connection.remoteAddress,
          votes: 0
        });
        res.status(200).json({
          success: true,
          msg: "Submission successfully entered.",
          data: newSubmission
        });
        return;
      } else {
        saveSubmission(newSubmission, res);
      }
      

    } catch (err) {
      res.status(500).json({ msg: `${err}` });
    }
  
})

//@@ GET /api/submissions/:submissionId
// //@@ Display a specific submission BY SUBMISSION ID
// router.get('/:submissionId', function(req, res){
//   Submission.findById(req.params.submissionId, function(err, submission){
//     if(err){
//       res.status(404).json({msg: `Error Retrieving Submission ${req.params.submissionId}.`})
//     } else {
//       res.send(submission);
//     }
//   })
// })

module.exports = router;
