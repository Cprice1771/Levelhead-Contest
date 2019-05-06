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
  rumpusCreatorId: {
    type: String,
    // required: true
  },
  lookupCode: {
    type: String,
    // required: true
  },
  submittedByEmail: {
    type: String,
    // required: true
  },
  submittedByDiscordId: {
    type: String,
    // required: true
  },
  votes: {
    type: Array,
    voteId: {
      type: String
    }
  },
  overwrite: {
    type: Boolean,
    required: true
  }
})
let Submission = module.exports = mongoose.model('Submission', submissionSchema);
