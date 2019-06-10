let mongoose = require('mongoose');

let seasonSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    levelsInSeason: [
        {
            levelName: {
                type: String
            },
            creatorAlias: {
                type: String
            },
            lookupCode: {
                type: String
            },
            diamondTime: {
                type: Number
            },
            goldTime: {
                type: Number
            },
            silverTime: {
                type: Number
            },
            bronzeTime: {
                type: Number
            },
        }
    ],
    lastUpdatedScores: {
        type: Date,
    },

})
let Season = module.exports = mongoose.model('Season', seasonSchema);