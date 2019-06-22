let mongoose = require('mongoose');

let userScoreSchema = mongoose.Schema({
    seasonId: {
        type: String,
        required: true
    },
    levelLookupCode: {
        type: String,
        required: true
    },
    value: {
        type: Number,
        required: true
    },
    userId: {
        type: String,
        required: true
    },
    rumpusId: {
        type: String,
        required: true
    },
    rumpusAlias: {
        type: String,
        required: false
    },

})
let UserScore = module.exports = mongoose.model('UserScore', userScoreSchema);