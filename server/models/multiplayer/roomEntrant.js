let mongoose = require('mongoose');

let roomEntrant = mongoose.Schema({
    roomId: {
        type: String,
        required: true,
    },
    currentBestTime: {
        type: Number,
        required: false
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
    discordDisplayName: {
        type: String,
        required: false
    },
    lastUpdatedDate: {
        type: Date,
        required: true,
    },
    lastKeepAlive: {
        type: Date,
        required: false,
    },
    wins: {
        type: Number,
        required: false
    },
    bronzes: {
        type: Number,
        required: false
    },
    silvers: {
        type: Number,
        required: false
    },
    golds: {
        type: Number,
        required: false
    }
})
let RoomEntrant = module.exports = mongoose.model('RoomEntrant', roomEntrant);