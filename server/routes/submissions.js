const express = require('express');
const router = express.Router();
const Submission = require("../models/submission")


var saveSubmission = (newSubmission, res) => {
  newSubmission.save().then(sub => {
      res.status(200).json({
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





// @@ POST /api/submissions
// @@ Creates a new level submission
router.post('/', async function(req, res){
  const newSubmission = new Submission({
    contestId: req.body.contestId,
    dateSubmitted: req.body.dateSubmitted,
    rumpusCreatorId: req.body.rumpusCreatorId,
    lookupCode: req.body.lookupCode,
    submittedByEmail: req.body.submittedByEmail,
    submittedByDiscordId: req.body.submittedByDiscordId,
    overwrite: req.body.overwrite
  });


  try {
      //Validate level hasn't already been submitted
      let existingSubmission = await Submission.find( {$and:[{ lookupCode: req.body.lookupCode }, { contestId: req.body.contestId }]});
      if(existingSubmission[0] != null) {
        res.status(200).json({
          msg: `This level code has already been submitted to this contest.`,
          submissionId: `${existingSubmission[0]._id} `
        });
        return;
      }

      //Validate if user has already submitted a level
      let existingUserSubmission = Submission.find( {$and:[{ rumpusCreatorId: req.body.rumpusCreatorId}, { contestId: req.body.contestId}]});
      if(!!existingUserSubmission[0] && !req.body.overwrite) {
        res.status(200).json({ msg: 'User has already submitted to contest with a different level code, can resubmit with a overwrite flag'});
        return;
      }
      
      saveSubmission(newSubmission, res);

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
