let mongoose = require('mongoose');

let room = mongoose.Schema({
    levelTime: {
        type: Number,
        required: true,
    },
    downtime: {
        type: Number,
        required: true,
    },
    currentLevelCode: {
        type: String,
        required: true
    },
    currentPhaseStartTime: {
        type: Date,
        required: true,
    },
    nextPhaseStartTime: {
        type: Date,
        required: true
    },
    phase: {
        type: String,
        required: true
    },
    maxParticipants: {
        type: Number,
        required: true,
    },
    levelDetails: {
        type: Object,
        required: false
    }
})
let Room = module.exports = mongoose.model('Room', room);