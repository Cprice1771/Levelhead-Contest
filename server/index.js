const express = require('express')
const app = express()
const port = 3000
const mongoose = require('mongoose');
const bodyParser = require('body-parser')
const path = require('path');
const cron = require("node-cron");
const RumpusAPI = require('./uitl/rumpusAPI');
const contest = require('./models/contest');

require('dotenv').config()

var https_redirect = function(req, res, next) {
  if (process.env.NODE_ENV === 'production') {
      if (req.headers['x-forwarded-proto'] != 'https') {
          return res.redirect('https://' + req.headers.host + req.url);
      } else {
          return next();
      }
  } else {
      return next();
  }
};

app.use(https_redirect);

app.use(express.static(path.join(__dirname, '../client/build')));




app.use(express.json());
app.use(express.urlencoded({ extended: false }));



let users = require('./routes/users')
app.use('/api/users', users)

let contests = require('./routes/contests')
app.use('/api/contests', contests)

let submissions = require('./routes/submissions')
app.use('/api/submissions', submissions)

let votes = require('./routes/votes')
app.use('/api/votes', votes)

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname+'/../client/build/index.html'));
});


mongoose.connect(process.env.DB_URL, { useNewUrlParser: true }).then(
  () => {
    console.log("Database connected...")

    //starts server, heroku needs process.env.port for port assignment
    app.listen(process.env.PORT || port, ()=> {
      console.log(`App started on port ${process.env.PORT} // ${port}...`)
    })
  },
  err => {
    console.log(err)
  }
);

//Update level metadata every minute
cron.schedule("0 * * * *", async function() {

  console.log('Running job');
  let contests = await contest.find();
  const runDate = new Date();
  //Make sure we run at midnight when the contest closes 1 last time.
  runDate.setMinutes(runDate.getMinutes() - 10);
  for(const contest of contests) {
    try {
      if(runDate < contest.votingEndDate) {
        await RumpusAPI.updateTopScores(contest._id);
      }
    } catch(err) {
      console.log(`Error: ${err}`);
    }
  }

  console.log('Job finished');
});
