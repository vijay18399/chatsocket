var express = require("express");
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var Sentiment = require("sentiment");
var sentiment = new Sentiment();
var spamcheck = require("spam_detecter");
var config = require("./config/config");
var Message = require("./models/message");
var jwt = require("jsonwebtoken");
var cors = require("cors");
var app = express();
var urlize = require("urlize.js");
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
mongoose.connect(config.db, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true
});

const connection = mongoose.connection;

connection.once("open", () => {
  console.log("MongoDB database connection established successfully!");
});

connection.on("error", err => {
  console.log(
    "MongoDB connection error. Please make sure MongoDB is running. " + err
  );
  process.exit();
});

let server = require("http").createServer(app);
let io = require("socket.io")(server);

io.on("connection", socket => {
  socket.on("logout", data => {
    console.log(data);
    io.emit("logout", "data");
  });

  socket.on("group_created", data => {
    console.log(data);
    io.emit("group_created", data);
  });
  socket.on("group_deleted", data => {
    console.log(data);
    io.emit("group_deleted", data);
  });
  socket.on("logined", data => {
    console.log(data);
    io.emit("logined", data);
  });
  socket.on("typing", data => {
    console.log(data);
    io.emit("typing", data);
  });
  socket.on("signup", data => {
    io.emit("new_user", data);
  });

  socket.on("send-message", message => {
    console.log(message);
    console.log(typeof message);
   // message = JSON.parse(message);
    var x = sentiment.analyze(message.message);
    message.score = x.score;
    message.spamcheck = spamcheck.detect(message.message);
    message.message.replace(/(https?:\/\/[^\s]+)/g,"<a href='$1'  >$1</a>")
    message.createdAt = new Date();
    message.message = urlize(message.message);
    let newMessage = Message(message);
    newMessage.save(function(err, data) {
      if (err) {
        console.log(err);
      }
      if (data) {
        io.emit("message", data);
        console.log(data);
      }
    });
  });

  socket.on("message_in_group", message => {
    console.log(message);
    var x = sentiment.analyze(message.message);
    message.score = x.score;
    message.spamcheck = spamcheck.detect(message.message);
    message.createdAt = new Date();
    message.message = urlize(message.message);
    let newMessage = Message(message);
    newMessage.save(function(err, data) {
      if (err) {
        console.log(err);
      }
      if (data) {
        console.log(data);
        io.emit("message_in_group", data);
      }
    });
  });
});

var port = process.env.PORT || 5000;

server.listen(port, function() {
  console.log("socket.io listening in http://localhost:" + port);
});
