const express = require('express');
const app = express();
const PORT = 8080;

function req_log(req) {
    const {method, url} = req;
    const ip = req.ip.split(":").slice(-1)[0];
    console.log(`${method} ${url} from ${ip}`);
};

// Data
const data = {
    People: [
        {name: "Lucas", age: 22}
    ]
};

// API Endpoints
app.get('/api/data', (req, res) => {
    req_log(req);
    res.json(data);
});

// Webpage Endpoints
app.get('/', (req, res) => {
    req_log(req);
    res.send("<h1>Homepage</h1>");
});

// Start Server
app.listen(PORT, () => {
    console.clear();
    console.log(`Server has started on: http://127.0.0.1:${PORT}\n`);
});