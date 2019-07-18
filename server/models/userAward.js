let mongoose = require('mongoose');

let userAwardSchema = mongoose.Schema({
    userId: {
        type: String,
        required: true
    },
    award: {
        type: String,
    },
    awardImage: {
        type: String
    },
    awardType: {
        type: String
    }
})
let UserAward = module.exports = mongoose.model('UserAward', userAwardSchema);