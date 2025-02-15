const express = require('express');
const mongoose = require('mongoose');
const app = express();
const cors = require('cors');
const userRoutes = require('./routes/userRoutes')
const feedbackRoutes = require('./routes/feedbackRoutes')
const complaintRoutes = require('./routes/complaintRoutes')
require('dotenv').config()

app.use(express.json());
app.use(cors());
app.use('/api/user/', userRoutes)
app.use('/api/feedback/', feedbackRoutes)
app.use('/api/complaints', complaintRoutes)

app.get('/', (req, res) => {
    console.log("RAN")
    res.send("Hello World");
});

mongoose.connect(process.env.MONGO_URI).then(() => {
    app.listen(process.env.PORT, () => {
        console.log('Server is running on port', process.env.PORT)
    })
}).catch((error) => {
    console.log("Failed to start server");
})
