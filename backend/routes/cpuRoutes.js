const express = require('express')
const router = express.Router()
const {registerCPU,updateCPU} = require('../controllers/cpu.js')

router.post('/register', registerCPU)
router.post('/update', updateCPU)

module.exports = router 