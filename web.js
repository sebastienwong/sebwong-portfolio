var path = require('path');
var express = require('express');
var app = express();
const PORT = process.env.PORT || 5000;

app.use(express.static(path.join((__dirname, 'public'))))
  .get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/pages/index.html'));
  })

  .listen(PORT);