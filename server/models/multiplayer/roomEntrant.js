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
    lastUpdatedDate: {
        type: Date,
        required: true,
    },
    lastKeepAlive: {
        type: Date,
        required: false,
    }
})
let RoomEntrant = module.exports = mongoose.model('RoomEntrant', roomEntrant);