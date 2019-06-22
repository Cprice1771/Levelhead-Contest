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
    seasonType: {
        type: String,
        required: true,
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
            diamondValue: {
                type: Number,
                required: true
            },
            goldValue: {
                type: Number,
                required: true
            },
            silverValue: {
                type: Number,
                required: true
            },
            bronzeValue: {
                type: Number,
                required: true
            },
            startDate: {
                type: Date,
                required: true
            },
            addedBy: {
                type: String,
                required: true,
            },
            lastUpdatedScores: {
                type: Date,
            }
        }
    ],
    entries: [
        {
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
                required: true,
            },
            diamonds: {
                type: Number,
                required: true,
            },
            golds: {
                type: Number,
                required: true,
            },
            silvers: {
                type: Number,
                required: true,
            },
            bronzes: {
                type: Number,
                required: true,
            },
            totalPoints: {
                type: Number,
                required: true,
            },
            timesSubmitted: {
                type: Number,
                required: true,
            },
            league: {
                type: String,
                requried: false
            }
        }
    ],
})
const  Season = module.exports = mongoose.model('Season', seasonSchema);