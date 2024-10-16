require('dotenv').config();

const express = require('express');
const router = require('./routes');
const connectToDiscoveryServer = require('./utils/configs/discovery');

const PORT = process.env.PORT || 3008;
const app = express();

app.use(express.json());
app.use(process.env.APP_PATH || '/api/v1/groups', router);

connectToDiscoveryServer();

const server = app.listen(PORT, () => {
    console.log('Server is running in port ' + PORT);
})
