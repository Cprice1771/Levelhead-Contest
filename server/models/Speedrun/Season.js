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
                type: String,
                required: true
            },
            diamondTime: {
                type: Number,
                required: true
            },
            goldTime: {
                type: Number,
                required: true
            },
            silverTime: {
                type: Number,
                required: true
            },
            bronzeTime: {
                type: Number,
                required: true
            },
            startDate: {
                type: Date,
                required: true
            }
        }
    ],
    entries: [
        {
            usedId: {
                type: String,
                required: true
            },
            Diamonds: {
                type: Number,
                required: true,
            },
            Golds: {
                type: Number,
                required: true,
            },
            Silvers: {
                type: Number,
                required: true,
            },
            Bronzes: {
                type: Number,
                required: true,
            },
            TotalPoints: {
                type: Number,
                required: true,
            },
            TimesSubmitted: {
                type: Number,
                required: true,
            },
            league: {
                type: String,
                requried: false
            }
        }
    ],
    lastUpdatedScores: {
        type: Date,
    },

})
let Season = module.exports = mongoose.model('Season', seasonSchema);