// server.js
// where your node app starts

// init project
var express = require('express');
var app = express();
var dateFormat = require("dateformat");
var port = process.env.PORT || 3000;

// enable CORS (https://en.wikipedia.org/wiki/Cross-origin_resource_sharing)
// so that your API is remotely testable by FCC
var cors = require('cors');
app.use(cors({optionsSuccessStatus: 200}));  // some legacy browsers choke on 204

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function (req, res) {
  res.sendFile(__dirname + '/views/index.html');
});


// your first API endpoint...
app.get("/api/hello", function (req, res) {
  console.log("greeting: 'hello API' ");
  res.json({greeting: 'hello API'});
});

app.get("/api/:date?", (req, res) => {
  let inputDate = new Date(req.params.date);
  if (!inputDate) return res.json({ error : "Invalid Date" });
  console.log(inputDate);
  let timeStamp = inputDate.getTime();
  // change to format "Thu, 01 Jan 1970 00:00:00 GMT"
  let formattedTime = inputDate.toUTCString();
  res.json({ unix : timeStamp, UTC : formattedTime});


});

// listen for requests :)
// Original version: var listener = app.listen(process.env.PORT, function () {
var listener = app.listen(port, () => {
  console.log('Your app is listening on port ' + listener.address().port);
});
