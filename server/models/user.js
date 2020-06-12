let mongoose = require('mongoose');

let userSchema = mongoose.Schema({
    discordId: {
        type: String,
        required: true
    },
    rumpusId: {
        type: String,
    },
    rumpusAlias: {
        type: String
    },
    discordDisplayName: {
        type: String,
    },
    dateRegistered: {
        type: Date
    },
    discordUniqueId: { 
        type: String,
    },
    //Admin or User
    role: {
        type: String,
    },
    apiKey: {
        type: String,
    },
    keyPermissions: {
        type: Array,
    },
    raceRecords: {
        type: Object
    },
    currentRaceRecords: {
        type: Object
    }

})
let User = module.exports = mongoose.model('User', userSchema);