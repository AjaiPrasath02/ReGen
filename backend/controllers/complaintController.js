const Complaint = require('../models/complaintModel')

const submitComplaint = async (req, res) => {
    const { cpuAddress, modelName, serialNumber, message, labAssistantName } = req.body;
    try {
        if (!cpuAddress || !modelName || !serialNumber || !message || !labAssistantName) {
            throw Error('All fields must be filled');
        }
        const complaint = await Complaint.create({
            cpuAddress,
            modelName,
            serialNumber,
            message,
            labAssistantName,
        });
        res.status(200).json(complaint);
    } catch (error) {
        // Check for unique constraint violation
        if (error.code === 11000 && error.keyPattern && error.keyPattern.serialNumber) {
            return res.status(400).json({ error: 'Error submitting the issue, check if resubmitted issue (not allowed)'});
        }
        res.status(400).json({ error: error.message });
    }
};


const getComplaints = async (req, res) => {
    try {
        const complaints = await Complaint.find({ status: 'pending' }).sort({ createdAt: -1 })
        res.status(200).json(complaints)
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

const resolveComplaint = async (req, res) => {
    const { id } = req.params

    try {
        const complaint = await Complaint.findByIdAndUpdate(
            id,
            { status: 'resolved' },
            { new: true }
        )
        res.status(200).json(complaint)
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

module.exports = { submitComplaint, getComplaints, resolveComplaint } 