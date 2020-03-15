const express = require('express');
const app = express();
const database = require('./database');

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.set('json spaces', 2);

database.initializeConnection((err, client) => {
    console.log("database initialized...");

    app.use(require('./routes/smsResponse'));
    
    app.listen(5000, (req, res) => {
        console.log("Now listening on port 5000");
    });

});