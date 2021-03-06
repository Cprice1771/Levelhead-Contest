let mongoose = require('mongoose');

let voteSchema = mongoose.Schema({
  submissionId: {
    type: String,
    required: true
  },
  contestId: {
    type: String,
    required: true
  },
  userId: {
    type: String,
    required: true
  },
  dateVoted: {
    type: Date,
    required: true
  },
  submittedIp: {
    type: String,
    require: true,
  },
})

let Vote = module.exports = mongoose.model('Vote', voteSchema);
