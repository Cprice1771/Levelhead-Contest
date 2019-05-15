let mongoose = require('mongoose');

let rumpusSchema = mongoose.Schema({
    rumpusCredentials: {
        type: String,
        required: true
    }
})
let RumpusConfig = module.exports = mongoose.model('rumpusConfig', rumpusSchema);