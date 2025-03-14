const mongoose = require('mongoose')
const Schema = mongoose.Schema

const cpuSchema = new Schema({
    cpuAddress: {
        type: String,
        required: true
    },
    embeddings: {
        type: [Number],
        required: true
    },
},    
{ timestamps :true }
)

module.exports = mongoose.model('Cpu', cpuSchema) 