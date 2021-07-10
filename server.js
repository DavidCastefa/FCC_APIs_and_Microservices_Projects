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
var multer  = require('multer');
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

// create route for Project 4 - Exercise Tracker
app.get("/users", (req, res) => {
  res.sendFile(__dirname + '/views/exerciseTracker.html');
});

// create route for Project 4 - Exercise Tracker
app.get("/filemetadata", (req, res) => {
  res.sendFile(__dirname + '/views/fileMetadata.html');
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
// create application/x-www-form-urlencoded parser
var urlencodedParser = bodyParser.urlencoded({ extended: false })
// post the form for the requested url
app.post("/api/shorturl", urlencodedParser, (req, res) => {
  let originalUrl = req.body.url;
  // if URL is invalid, return error
  // https://stackoverflow.com/questions/5717093/check-if-a-javascript-string-is-a-url
  var pattern = new RegExp('^(https?:\\/\\/)?'+ // protocol
    '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // domain name
    '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
    '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
    '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
    '(\\#[-a-z\\d_]*)?$','i'); // fragment locator
  if (pattern.test(originalUrl) == false) {
    return res.json({ error: 'invalid url' })
  }
  // generate a random number between 100 and 999 for the shortened URL
  let shortUrl = Math.floor(Math.random() * (999 - 100 +1)) + 100;
  // save requested url into MongoDB
  let newUrl = new Url ({
    original_url: originalUrl,
    short_url: shortUrl
  });
  newUrl.save( (err, data) => {
    if (err) return console.log(err);
    // done(null, data) -> apparently this is not needed
  });
  // return JSON object as requested
  res.json({
    original_url : originalUrl,
    short_url : shortUrl
  });
});
// If shortened URL is used, redirect to original web page
app.get("/api/shorturl/:shortUrl", (req, res) => {
  let requestedUrl = Url.findOne({short_url: req.params.shortUrl}, (err, urlFound) => {
    if (err) return console.log(err);
    res.redirect(urlFound.original_url);
  });
});

// Project 4: Exercise Tracker
// create Mongoose schema and model
const exerciseUserSchema = new mongoose.Schema({
  username:  String,
  exercises:  [Object]
});
let ExerciseUser = mongoose.model('ExerciseUser', exerciseUserSchema);
// request POST of new user
app.post("/api/users", urlencodedParser, (req, res) => {
  // create new entry in MongoDB
  let newUser = new ExerciseUser ({
    username: req.body.username
  });
  // save new user in MongoDB
  newUser.save( (err, data) => {
    if (err) return console.log(err);
    // return object with username and _id
    res.json({
      username : newUser.username,
      _id: newUser._id
    });
  });
});
// request GET for an array of all users
app.get("/api/users", (req, res) => {
  ExerciseUser.find()
    .select('-exercises')  // remove the exercises from the result
    .exec((err, arrayOfUsers) => {
      if (err) return console.log(err);
      // done(null, personFound)
      res.send(arrayOfUsers);
  });
});
// request POST of new exercise
app.post("/api/users/:_id/exercises", urlencodedParser, (req, res) => {
  // if date left blank, use today
  let exerciseDate = req.body.date;
  if (exerciseDate == "") exerciseDate = new Date().toISOString().slice(0, 10);
  // save exercise as an object
  let newExercise = {
    description: req.body.description,
    duration: parseInt(req.body.duration),  // required as a number to pass test
    date: new Date(exerciseDate).toDateString(), // required format: Thu Jul 08 2021
  }
  // find user and add excercise
  ExerciseUser.findById({_id: req.params._id}, (err, personFound) => {
    if (err) return console.log(err);
    personFound.exercises.push(newExercise);  // add object to the array
    // save to MongoDB
    personFound.save( (err, updatedPerson) => {
      if (err) return console.log(err);
      // return object with user and new exercise info
      res.json({
        _id: updatedPerson._id,
        username: updatedPerson.username,
        date: newExercise.date,
        duration: newExercise.duration,
        description: newExercise.description,
      });
    })
  })
});
// request GET to retrieve a full exercise log
// some help here from Ganesh H at https://www.youtube.com/watch?v=ANfJ0oGL2Pk
app.get("/api/users/:_id/logs", (req, res) => {
  ExerciseUser.findById({_id: req.params._id}, (err, personFound) => {
    if (err) return console.log(err);
    let log = personFound.exercises;
    // if there is a 'from' or 'to' in the query, filter for those dates
    if ( req.query.from || req.query.to ) {
      // set default 'from' to 0 and convert to unix timestamp
      let dateFrom = new Date(0).getTime();
      // set default 'to' to today and convert to unix
      let dateTo = new Date().getTime();
      // if applicable, get the 'from' date in the query and convert to unix
      if (req.query.from) dateFrom = new Date(req.query.from).getTime();
      // same for 'to' date
      if (req.query.to) dateTo = new Date(req.query.to).getTime();
      // filter for dates equal to or between requested dates
      log = log.filter( session => {
        let sessionDate = new Date(session.date).getTime();
        return sessionDate >= dateFrom && sessionDate <= dateTo
      });
    }
        // if there is a 'limit' in the query, slice off the rest of the exercises
    if (req.query.limit) {
      log = log.slice(0, req.query.limit)
    };
    // return object with user info, count and exercise logs
    res.json({
      _id: personFound._id,
      username: personFound.username,
      count: log.length,
      log: log
    });

  });
});

// Project 5: File Metadata Microservice
// request POST of file
// Note: to pass FCC tests, the form must be at the root of the app,
//   in this case at https://fcc-apis-projects-dkr.herokuapp.com/filemetadata
app.post("/filemetadata/api/fileanalyse",
  //'upfile' from the form input in fileMetadata.html
  multer({ dest: 'uploadedFiles/' }).single('upfile'),
  (req, res) => {
    res.json({
      name: req.file.originalname,
      type: req.file.mimetype,
      size: req.file.size,
    });
});

// Project 1: create timestamp microservice
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
