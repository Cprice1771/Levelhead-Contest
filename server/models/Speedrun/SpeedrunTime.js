let mongoose = require('mongoose');

let speedrunTimeSchema = mongoose.Schema({
    seasonId: {
        type: String,
        required: true
    },
    levelLookupCode: {
        type: String,
        required: true
    },
    time: {
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
        required: true
    },

})
let SpeedrunTime = module.exports = mongoose.model('SpeedrunTime', speedrunTimeSchema);