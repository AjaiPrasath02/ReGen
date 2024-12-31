const express = require('express');
const mongoose = require('mongoose');
const app = express();
const cors = require('cors');
const userRoutes = require('./routes/userRoutes')
const feedbackRoutes = require('./routes/feedbackRoutes')

app.use(express.json());
app.use(cors());
app.use('/api/user/', userRoutes)
app.use('/api/feedback/', feedbackRoutes)

app.get('/', (req, res) => {
    console.log("RAN")
    res.send("Hello World");
});

mongoose.connect('mongodb+srv://root:1234@book-store-mern.5jlmcjk.mongodb.net/?retryWrites=true&w=majority&appName=Book-Store-MERN').then(() => {
    app.listen(4000, () => {
        console.log('Server is running on port 4000')
    })
}).catch((error) => {
    console.log("Failed to start server");
})
