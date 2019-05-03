const express = require('express');
const router = express.Router();
const Submission = require("../models/submission")

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
router.post('/', function(req, res){
  const newSubmission = new Submission({
    contestId: req.body.contestId,
    dateSubmitted: req.body.dateSubmitted,
    rumpusCreatorId: req.body.rumpusCreatorId,
    lookupCode: req.body.lookupCode,
    submittedByEmail: req.body.submittedByEmail,
    submittedByDiscordId: req.body.submittedByDiscordId
  });
  newSubmission.save(function(err, submission){
    if(err){
      res.status(404).json({ msg: `${err}`})
    } else {
      res.send(submission);
    }
  })
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
