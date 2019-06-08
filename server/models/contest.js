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
  createdBy: {
    type: String
  },
  startDate: {
    type: Date,
    // required: true
  },
  //Only applies to Building contests
  submissionEndDate: {
    type: Date,
    // required: true
  },
  //End date for speedrunners as well
  votingEndDate: {
    type: Date,
    // required: true
  },
  topScores: {
    type: Array
  },
  lastUpdatedScores: {
    type: Date,
  },
  /*Contest Rules */
  //building or speedrun
  contestType: {
    type: String,
  },
  /*Speedrun Contest Rules */
  countCrowns: {
    type: Boolean,
  },
  countShoes: {
    type: Boolean,
  },
  /*Builder Contest Rules */
  maxVotePerUser: {
    type: Number,
  },
  displayTopScore: {
    type: Boolean,
  },
  allowPreviousLevels: {
    type: Boolean,
  },
  requireDailyBuild: {
    type: Boolean,
  },
  requireLevelInTower: {
    type: Boolean,
  },

})
let Contest = module.exports = mongoose.model('Contest', contestSchema);