var https = require('https');
var http = require('http');
const fs = require('fs');
const app = require('./app.js');
const bodyparser = require("body-parser");

// var privateKey = fs.readFileSync('/etc/ssl/private.key', 'utf8').toString();

// var certificate = fs.readFileSync('/etc/ssl/certificate.crt', 'utf8').toString();

// var ca = fs.readFileSync('/etc/ssl/ca_bundle.crt').toString();

// var options = { key: privateKey, cert: certificate, ca: ca };

// var server = https.createServer(options, app);

var server = http.createServer(app);

app.use(bodyparser.json({ limit: '100mb' }));
app.use(bodyparser.urlencoded({ limit: '100mb', extended: true }));

var io = require("socket.io")(server, {
  maxHttpBufferSize: 10e7,
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

require('./socket/msglist.js')(io);


const PORT = process.env.PORT || 3000;

// Create HTTP server
//const server = http.createServer(app);

// Start the server
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
