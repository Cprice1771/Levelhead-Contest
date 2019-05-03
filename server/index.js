const express = require('express')
const app = express()
const port = 3000
const mongoose = require('mongoose');
const bodyParser = require('body-parser')

require('dotenv').config()

app.use(express.json());
app.use(express.urlencoded({ extended: false }));


let contests = require('./routes/contests')
app.use('/api/contests', contests)

let submissions = require('./routes/submissions')
app.use('/api/submissions', submissions)




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
