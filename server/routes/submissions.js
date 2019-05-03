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
    submittedByDiscordId: req.body.submittedByDiscordId,
    overwrite: req.body.overwrite
  });

  if(req.body.overwrite == true){
    newSubmission.save(function(err, submission){
      if(err){
        res.status(500).json({ msg: `${err}`})
      } else {
        res.status(200).json({
          msg: "Submission successfully entered.",
          data: submission
        })
      }
    })  
  } else {
    //if lookupCode already in DB, return err
    //if USER SUBMITTING already exists in the contest, return err, option to overwrite with new submission
    Submission.find( {$and:[{ lookupCode: req.body.lookupCode }, { contestId: req.body.contestId }]}, function(err, submission){
      if(err){
        res.status(500).json({ msg: `${err}` })
      }else {
        if(submission[0] == null){
          //check to see if this user already submitted to this contest
          Submission.find( {$and:[{ rumpusCreatorId: req.body.rumpusCreatorId}, { contestId: req.body.contestId}]}, function(err, submission){
            if(err){
              res.status(500).json({ msg: `${err}` })
            } else {
              if(submission[0] == null){
                // user has not submitted to contest, save to contest 
                newSubmission.save(function(err, submission){
                  if(err){
                    res.status(500).json({ msg: `${err}`})
                  } else {
                    // res.send(submission);
                    res.status(200).json({
                      msg: "Submission successfully entered.",
                      data: submission
                    })
                  }
                })        
              } else {
                // user has already submitted to contest, can resubmit with a overwrite flag
                res.status(200).json({ msg: 'User has already submitted to contest with a different level code, can resubmit with a overwrite flag'})
              }
            }
          })
        } else {
          if(submission[0].rumpusCreatorId == req.body.rumpusCreatorId){
            res.status(200).json({ msg: 'User has already submitted to contest with a different level code, can resubmit with a overwrite flag'})
          } else {
            res.status(200).json({
              msg: `This level code has already been submitted to this contest.`,
              submissionId: `${submission[0]._id} `
            })
          }
        }
      }
    })
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
