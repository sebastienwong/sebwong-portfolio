var path = require('path');
var express = require('express');
const PORT = process.env.PORT || 5000;

const app = express()
  .use(express.static(path.join((__dirname, 'public'))))
  .get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/pages/index.html'));
  })

  .listen(PORT);

//const http = require('http').Server(app);
const io = require('socket.io')(app);

io.on("connection", (socket) => {
  console.log("someone is here");
});