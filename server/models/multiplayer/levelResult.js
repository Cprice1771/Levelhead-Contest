let mongoose = require('mongoose');

let levelResultSchema = mongoose.Schema({
    levelResultId: {
        type: String,
        required: true
    },
    levelLookupCode: {
        type: String,
        required: true
    },
    results: [
        {
            resultTime: {
                type: Number,
                required: true
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
        }
    ],
    completedDate: {
        type: Date
    }
   

})
let LevelResult = module.exports = mongoose.model('LevelResult', levelResultSchema);