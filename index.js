const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = 8002;

app.use(cors());
app.use(bodyParser.json());

const usercard = require('./route/usercard');

app.use('/usercard', usercard);

app.listen(port, () => {
    console.log(`app start in port ${port}`);
});