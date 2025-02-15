/*
Purpose: Boots up and tells app to use routes.js to navigate 
*/
require('dotenv').config();
const { createServer } = require('http');
const next = require('next');

const app = next({
    dev: process.env.NODE_ENV !== 'production'
});
const port = process.env.PORT || 3000;

const routes = require('./routes');
const handler = routes.getRequestHandler(app);

app.prepare().then(() => {
    createServer(handler).listen(port, (err) => {
        if (err) throw err;
        console.log(`Ready on http://localhost:${port}`);
        // \nchrome --profile-directory="Profile 1" http://localhost:3000
    });
});