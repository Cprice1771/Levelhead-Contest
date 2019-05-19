let mongoose = require('mongoose');

let contestSchema = mongoose.Schema({
  name: {
    type: String,
    // required: true
  },
  theme: {
    type: String,
    // required: true
  },
  prizes: {
    type: String,
    // required: true
  },
  rules: {
    type: String,
    // required: true
  },
  startDate: {
    type: Date,
    // required: true
  },
  submissionEndDate: {
    type: Date,
    // required: true
  },
  votingEndDate: {
    type: Date,
    // required: true
  },
  maxVotePerUser: {
    type: Number,
  },
  topScores: {
    type: Array
  },
  lastUpdatedScores: {
    type: Date,
  }
})
let Contest = module.exports = mongoose.model('Contest', contestSchema);