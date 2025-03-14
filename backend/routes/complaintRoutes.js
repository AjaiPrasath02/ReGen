const express = require('express')
const router = express.Router()
const { submitComplaint, getComplaints, resolveComplaint } = require('../controllers/complaint')

router.post('/submit', submitComplaint)
router.get('/getComplaints', getComplaints)
router.patch('/resolve/:id', resolveComplaint)

module.exports = router 