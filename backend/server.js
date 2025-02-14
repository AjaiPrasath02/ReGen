const express = require('express');
const mongoose = require('mongoose');
const app = express();
const cors = require('cors');
const userRoutes = require('./routes/userRoutes')
const feedbackRoutes = require('./routes/feedbackRoutes')
const complaintRoutes = require('./routes/complaintRoutes')

app.use(express.json());
app.use(cors());
app.use('/api/user/', userRoutes)
app.use('/api/feedback/', feedbackRoutes)
app.use('/api/complaints', complaintRoutes)

app.get('/', (req, res) => {
    console.log("RAN")
    res.send("Hello World");
});

mongoose.connect('mongodb+srv://Regen:Regen123@regen.f3lre.mongodb.net/?retryWrites=true&w=majority&appName=regen').then(() => {
    app.listen(4000, () => {
        console.log('Server is running on port 4000')
    })
}).catch((error) => {
    console.log("Failed to start server");
})
