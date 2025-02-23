const mongoose = require('mongoose')
const Schema = mongoose.Schema

const complaintSchema = new Schema({
    cpuAddress: {
        type: String,
        required: true
    },
    modelName: {
        type: String,
        required: true
    },
    serialNumber: {
        type: String,
        required: true,
        // unique: true
    },
    message: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'resolved'],
        default: 'pending'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    labAssistantName: {
        type: String,
        required: true
    },
    labNumber: {
        type: String,
        required: true
    }
})

module.exports = mongoose.model('Complaint', complaintSchema) 