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
    awardsHandedOut: {
        type: Boolean
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
            legendValue: {
                type: Number
            },
            bonusAward : {
                awardValue: Number,
                awardIcon: String,
                awardName: String,
            },
            diamondValue: {
                type: Number,
                required: true
            },
            platinumValue: {
                type: Number,
                required: true,
                default:0,
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
            record: {
                type: Object
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
            platinums: {
                type: Number,
                required: true,
                default: 0,
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
            hasLegend: {
                type: Boolean,
            },
            awards: [],
            totalPoints: {
                type: Number,
                required: true,
            },
            timesSubmitted: {
                type: Number,
                required: true,
            },
            totalTime: {
                type: Number,
                required: false,
            },
            league: {
                type: String,
                requried: false
            },
            lastUpdatedScores: {
                type: Date,
            }
        }
    ],
})
const  Season = module.exports = mongoose.model('Season', seasonSchema);