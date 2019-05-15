let mongoose = require('mongoose');

let configSchema = mongoose.Schema({
    key: {
        type: String,
        required: true
    }
}, { collection: 'config'})
let Config = module.exports = mongoose.model('Config', configSchema);