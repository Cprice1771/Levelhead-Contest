let mongoose = require('mongoose');

let submissionSchema = mongoose.Schema({
  contestId: {
    type: String,
    // required: true
  },
  dateSubmitted: {
    type: Date,
    // required: true
  },
  submittedIp: {
    type: String,
    require: true,
  },
  rumpusCreatorId: {
    type: String,
    // required: true
  },
  rumpusUserName: {
    type: String,
    // required: true
  },
  lookupCode: {
    type: String,
    // required: true
  },
  levelMetaData : {
    type: Object,
    // required: true
  },
  submittedByDiscordId: {
    type: String,
    // required: true
  },
  votes: {
    type: Number,
  },
  overwrite: {
    type: Boolean,
    required: true
  }
})
let Submission = module.exports = mongoose.model('Submission', submissionSchema);
