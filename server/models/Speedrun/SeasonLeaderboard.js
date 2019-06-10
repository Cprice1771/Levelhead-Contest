let mongoose = require('mongoose');

let seasonLeaderboardSchema = mongoose.Schema({
    seasonId: {
        type: String,
        required: true
    },
    leaderboard: {
        MegaJemLeague: [
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
            }
        ],
        TurboJemLeague: [
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
            }
        ],
        JemLeague: [
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
            }
        ],
        ApprenticeLeague: [
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
            }
        ]
    }


});
let SeasonLeaderboard = module.exports = mongoose.model('seasonLeaderboardSchema', seasonLeaderboardSchema);