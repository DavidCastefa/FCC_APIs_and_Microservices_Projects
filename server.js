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
  console.log("req.params.date ->", req.params.date);
  console.log("typeof", typeof req.params.date);

  let inputDate  // declare variable to be used in if statements

  // check if date is blank
  if (req.params.date == undefined) {
    inputDate = new Date()
    console.log("inputDate blank ->", inputDate);
  } else {
    inputDate = new Date(req.params.date)
    console.log("inputDate not blank ->", inputDate);
  };

  // check if date is unix timestamp
  if (parseInt(req.params.date) > 10000 ) {    // If not unix, max would be the year 9999
    inputDate = new Date(parseInt(req.params.date));
  };

  // check if date is valid
  console.log("inputDate defined?", inputDate);
  if (inputDate == "Invalid Date") {
    return res.json({ error : "Invalid Date" })
  };

  // Change format to unix timestamp
  let timeStamp = inputDate.getTime();

  // change time format to "Thu, 01 Jan 1970 00:00:00 GMT"
  let formattedTime = inputDate.toUTCString();

  // display object with unix and utc keys
  res.json({ unix : timeStamp, utc : formattedTime});

});

// listen for requests :)
// Original version: var listener = app.listen(process.env.PORT, function () {
var listener = app.listen(port, () => {
  console.log('Your app is listening on port ' + listener.address().port);
});
