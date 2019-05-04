const express = require('express')
const app = express()
const port = 3000
const mongoose = require('mongoose');
const bodyParser = require('body-parser')
var cors = require('cors');

require('dotenv').config()

app.use(express.json());
app.use(express.urlencoded({ extended: false }));


let contests = require('./routes/contests')
app.use('/api/contests', contests)

let submissions = require('./routes/submissions')
app.use('/api/submissions', submissions)

// // Set up a whitelist and check against it:
// var whitelist = ['localhost:3000', 'localhost:3001']
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
