const express = require('express')
const app = express()
const port = 3000
const mongoose = require('mongoose');
const bodyParser = require('body-parser')
const cors = require('cors');
const path = require('path');

require('dotenv').config()


//app.use(express.static(path.join(__dirname, '../client/build')));

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

// Set up a whitelist and check against it:
// var whitelist = ['http://localhost:3000', 'http://localhost:3001', 'https://levelcup.herokuapp.com/']
// var corsOptions = {
//   origin: function (origin, callback) {
//     if (whitelist.indexOf(origin) !== -1) {
//       callback(null, true)
//     } else {
//       callback(new Error('Not allowed by CORS'))
//     }
//   }
// }

// // Then pass them to cors:
// app.use(cors(corsOptions));

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
