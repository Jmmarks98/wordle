const express = require('express'); 
const app = express(); 
const port = process.env.PORT || 3001; 
const cors = require('cors');


var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(
   cors({
      origin: "http://localhost:3000",
      methods: ["POST", "PUT", "GET", "OPTIONS", "HEAD", "PATCH", "DELETE"],
      credentials: false,
   })
);

var mongoose = require("mongoose");
mongoose.Promise = global.Promise;
mongoose.connect('mongodb+srv://jmarks:MongoDB032301@wordle.wwrnkvh.mongodb.net/test');

var userSchema = new mongoose.Schema({ // Schema for saving users
    Username: String,
    Password: String
   });

var gameSchema = new mongoose.Schema({ // Schema for saving games
   User: String,
   Guesses: Array,
   NumGuesses: Number,
   Solution: String,
   Win: Boolean
})

const User = mongoose.model("User", userSchema);
const Game = mongoose.model("Game", gameSchema);

app.post("/register", (req, res) => { // Enter new users into database
    var myData = new User(req.body);
    myData.save()
    .then(item => {
    res.send("item saved to database");
    })
    .catch(err => {
    res.status(400).send("unable to save to database");
    });
   });

app.post('/login', (req, res) => { // Check database for user info, returns success if username-password pair found
   var bool = false;
   var data = req.body
   User.find({}, {Username:1, Password:1})
   .then(User => {
      for(var i = 0; i < User.length; i++){
         if(User[i].Username == data.Username && User[i].Password == data.Password){
           bool = true
         }
      }
     if(bool){
      res.send({result: "success"})
     }
     else{
      res.send({result: "Authentication Failed"})
     }
   })
    });
app.post('/numGames', (req, res) => { // Retrieve number of games in database for user
   Game.count({User: {$eq: req.body.User}})
   .then(Count => {res.send({result: Count})})
})
app.post('/winPercent', (req, res) => { // Retrieve number of wins in database for user
   Game.count({User: {$eq: req.body.User}, Win: {$eq: true}})
   .then(Count => {res.send({result: Count})})
})

app.post("/saveGame", (req, res) => { // Add game to database
   var myData = new Game(req.body);
   console.log(myData)
   myData.save()
   .then(item => {
   res.send("item saved to database");
   })
   .catch(err => {
   res.status(400).send("unable to save to database");
   });
})

app.listen(port, () => console.log(`Listening on port ${port}`));

