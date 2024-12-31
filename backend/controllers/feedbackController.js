const Feedback = require('../models/feedbackModel')

const submitFeedback = async (req, res) => {
    const { name, email, message } = req.body

    try {
        if (!name || !email || !message) {
            throw Error('All fields must be filled')
        }

        const feedback = await Feedback.create({ name, email, message })
        res.status(200).json(feedback)
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

module.exports = { submitFeedback } 