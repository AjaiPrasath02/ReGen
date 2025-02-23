const Complaint = require('../models/complaintModel')

const submitComplaint = async (req, res) => {
    const { cpuAddress, modelName, serialNumber, message, labAssistantName, labNumber } = req.body;
    try {
        // Check if all fields are filled
        if (!cpuAddress || !modelName || !serialNumber || !message || !labAssistantName || !labNumber) {
            throw Error('All fields must be filled');
        }

        // Check if the latest complaint with the same serial number exists and is pending
        const existingComplaint = await Complaint.findOne({ serialNumber })
            .sort({ createdAt: -1 }); // Sort by creation date, newest first

        if (existingComplaint && existingComplaint.status === 'pending') {
            return res.status(400).json({
                error: 'A pending complaint already exists for this CPU. Please wait for it to be resolved.'
            });
        }

        // If no pending complaint exists (either no complaint or only resolved ones), create new complaint
        const complaint = await Complaint.create({
            cpuAddress,
            modelName,
            serialNumber,
            message,
            labAssistantName,
            labNumber
        });

        res.status(200).json(complaint);
    } catch (error) {
        // Check for unique constraint violation
        if (error.code === 11000 && error.keyPattern && error.keyPattern.serialNumber) {
            return res.status(400).json({ error: 'Error submitting the issue, check if resubmitted issue (not allowed)' });
        }
        res.status(400).json({ error: error.message });
    }
};


const getComplaints = async (req, res) => {
    try {
        const complaints = await Complaint.find().sort({ createdAt: -1 })
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