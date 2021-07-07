// server.js
// where your node app starts
// main reference: Useful Programmer walkthrough at
// https://www.youtube.com/playlist?list=PL3vpzVxKa3PiRLCMmR2FiuIJsSojZZgI8

// init project
var express = require('express');
var app = express();
var mongo = require('mongodb');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
require('dotenv').config();

// set the local port to 3000
var port = process.env.PORT || 3000;

// enable CORS (https://en.wikipedia.org/wiki/Cross-origin_resource_sharing)
// so that your API is remotely testable by FCC
var cors = require('cors');
app.use(cors({optionsSuccessStatus: 200}));  // some legacy browsers choke on 204

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

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

// Project 3: URL Shortener Microservice

// create Mongoose schema and model
const urlSchema = new mongoose.Schema({
  original_url:  String,
  short_url:  Number,
});
let Url = mongoose.model('Url', urlSchema);
// create application/json parser
var jsonParser = bodyParser.json()
// create application/x-www-form-urlencoded parser
var urlencodedParser = bodyParser.urlencoded({ extended: false })
let shortUrl = 0
// post the form for the requested url
app.post("/api/shorturl", urlencodedParser, (req, res) => {
  console.log("post request called");
  let originalUrl = req.body.url;
  shortUrl++;
  // save requested url into MongoDB
  let newUrl = new Url ({
    original_url: originalUrl,
    short_url: shortUrl
  });
  newUrl.save( (err, data) => {
    if (err) return console.log(err);
    console.log("newUrl successfully saved");
    // done(null, data) -> apparently this is not needed
  });
  // return JSON object as requested
  res.json({
    original_url : originalUrl,
    short_url : shortUrl
  });
});

app.get("/api/shorturl/:shortUrl", (req, res) => {
  console.log("req.params: " + req.params);
  console.log("req.params.shortUrl: " + req.params.shortUrl);
  let requestedUrl = Url.findOne({short_url: req.params.shortUrl}, (err, urlFound) => {
    if (err) return console.log(err);
    console.log("requestedUrl: " + requestedUrl);
    console.log("urlFound: " + urlFound);
    console.log("Original URL: " + urlFound.original_url);
    res.redirect(urlFound.original_url);
    //res.redirect(urlFound.original_url);
    // done(null, urlFound)
  });
  /* Url.find({short_url: req.params.shortUrl}).then(foundUrls => {
    let urlFound = foundUrls[0];
    console.log("urlFound: " + urlFound);
    console.log("Original URL: " + urlFound.original_url);
    //res.redirect(urlFound.original_url);
  }); */


  res.json({
    smurf: "big smurf"
  });
});

// Project 1: create timestamp Microservice
// Put this one last to avoid the "Invalid Date" message
// when running the other projects
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
