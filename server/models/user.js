let mongoose = require('mongoose');

let userSchema = mongoose.Schema({
    discordId: {
        type: String,
        required: true
    },
    rumpusId: {
        type: String,
    },
    discordDisplayName: {
        type: String,
    },
    dateRegistered: {
        type: Date
    }
})
let User = module.exports = mongoose.model('User', userSchema);