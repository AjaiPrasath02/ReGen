const express = require('express')
const router = express.Router()
const { submitComplaint, getComplaints, resolveComplaint } = require('../controllers/complaintController')

router.post('/submit', submitComplaint)
router.get('/pending', getComplaints)
router.patch('/resolve/:id', resolveComplaint)

module.exports = router 