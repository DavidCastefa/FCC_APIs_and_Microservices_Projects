// server.js
// where your node app starts
// main reference: Useful Programmer walkthrough at
// https://www.youtube.com/playlist?list=PL3vpzVxKa3PiRLCMmR2FiuIJsSojZZgI8

// init project
var express = require('express');
var app = express();
var dateFormat = require("dateformat");
// set the local port to 3000
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

// create route for Project 1 - Timestamp
app.get("/timestamp", (req, res) => {
  res.sendFile(__dirname + '/views/timestamp.html');
});

// create route for Project 2 - Header Parser
app.get("/headerparser", (req, res) => {
  res.sendFile(__dirname + '/views/headerParser.html');
});

// create route for Project 3 - URL Shortener
app.get("/urlshortener", (req, res) => {
  res.sendFile(__dirname + '/views/urlShortener.html');
});

// your first API endpoint...
app.get("/api/hello", function (req, res) {
  console.log("greeting: 'hello API' ");
  res.json({greeting: 'hello API'});
});

// Project 2: Request Header Parser Microservice
app.get("/api/whoami", (req, res) => {
  res.json({
    ipaddress : req.ip,
    language: req.headers["accept-language"],
    software: req.headers["user-agent"],
  });
});



// Project 1: create timestamp Microservice
app.get("/api/:date?", (req, res) => {
  let inputDate  // declare variable to be used in if statements
  // check if date is blank
  if (req.params.date == undefined) {
    inputDate = new Date()
  } else {
    inputDate = new Date(req.params.date)
  };
  // check if date is unix timestamp:
  // if not unix, max value would be the year 9999
  if (parseInt(req.params.date) > 10000 ) {
    inputDate = new Date(parseInt(req.params.date));
  };
  // check if date is valid
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
// Original version of next line:
// var listener = app.listen(process.env.PORT, function () {
var listener = app.listen(port, () => {
  console.log('Your app is listening on port ' + listener.address().port);
});
