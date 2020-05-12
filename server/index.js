const express = require('express')
const app = express()
const port = 3000
const mongoose = require('mongoose');
const bodyParser = require('body-parser')
const path = require('path');
const cron = require("node-cron");
const ContestHelpers = require('./util/ContestHelpers');
const SeasonHelpers = require('./util/SeasonHelpers');
const MultiplayerHelpers = require('./util/MultiplayerHelpers');
const contest = require('./models/contest');
const Season = require('./models/Speedrun/Season');
const Rooms = require('./models/multiplayer/room');
const RoomEntrants = require('./models/multiplayer/roomEntrant');
const SocketManager = require('./util/SocketManager');
const moment = require('moment');

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

let seasons = require('./routes/seasons')
app.use('/api/seasons', seasons)

let events = require('./routes/events');
app.use('/api/events', events);

let multiplayer = require('./routes/multiplayer');
app.use('/api/multiplayer', multiplayer);


app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname+'/../client/build/index.html'));
});


mongoose.connect(process.env.DB_URL, { 
  useNewUrlParser: true, 
  keepAlive: 1, 
  connectTimeoutMS: 30000, 
  reconnectTries: 30, 
  reconnectInterval: 5000 }).then(
  () => {
    console.log("Database connected...")

    //starts server, heroku needs process.env.port for port assignment
    var server = app.listen(process.env.PORT || port, ()=> {
      console.log(`App started on port ${process.env.PORT} // ${port}...`)
    });

    SocketManager.listen(server);
    
  },
  err => {
    console.log(err)
  }
);

//TODO: refactor all of these jobs into their own files/classes
//do room stuff for multiplayer every minute on the minute
cron.schedule("0,30 * * * * *", async function() {
  let rooms = await Rooms.find();
  for(const room of rooms) {

    if(room.phase === 'level') {
      await MultiplayerHelpers.getScoresForLevel(room.currentLevelCode, room.currentPhaseStartTime, room._id);
    }

    if(room.nextPhaseStartTime < new Date()) {
      if(room.phase === 'level') {
        setTimeout(async () => {
          await MultiplayerHelpers.getScoresForLevel(room.currentLevelCode, room.currentPhaseStartTime, room._id);
          await MultiplayerHelpers.startDowntimeForRoom(room);
          await MultiplayerHelpers.updateRoom(room);
        }, 15000)
        
      } else {
        await MultiplayerHelpers.startLevelForRoom(room);
      }
    }
    await MultiplayerHelpers.updateRoom(room);
  }
});

//Update level metadata every Hour
cron.schedule("0 * * * *", async function() {

  console.log('Running job');
  let contests = await contest.find();
  const runDate = new Date();
  //Make sure we run at midnight when the contest closes 1 last time.
  runDate.setMinutes(runDate.getMinutes() - 10);
  for(const contest of contests) {
    try {
      if(runDate < contest.votingEndDate) {
        await ContestHelpers.updateTopScores(contest._id);
      }
    } catch(err) {
      console.log(`Error: ${err}`);
    }
  }

  console.log('Updating Seasons');
  let seasons = await Season.find();
  const seasonRunDate = new Date();
  //Make sure we run at midnight when the season closes 1 last time.
  seasonRunDate.setMinutes(seasonRunDate.getMinutes() - 15);
  for(const sns of seasons) {
    try {
      if(seasonRunDate < sns.endDate) {
        await SeasonHelpers.updateSeasonLeaderboard(sns._id);
      }
    } catch(err) {
      console.log(`Error: ${err}`);
    }
  }

  console.log('hand out awards');

  await SeasonHelpers.handOutAllAwards();
  await ContestHelpers.handOutAwards();

  console.log('Job finished');
});
