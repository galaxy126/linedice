const https = require("https");
const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;
const TOKEN = process.env.channelAccessToken;
const cmdParse = require("../cmdPaser/paser");
const cmd = require("./cmd");
const _function = require("./function");
const middleware = require("@line/bot-sdk").middleware;

var MongoClient = require("mongodb").MongoClient;
var url = "mongodb://localhost:27017/";
var betFlag = false;

/*
const config = {
  channelAccessToken: process.env.channelAccessToken, 
  channelSecret: process.env.channelSecret,
};


app.post("/webhook", middleware(config), (req, res) => {
  req.body.events; // webhook event objects
  req.body.destination; // user ID of the bot (optional)
});
*/

app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);

app.get("/", (req, res) => {
  if (cmdParse.parser(JSON.parse(req.body.events).line) !== false) {
    console.log(cmdParse.parser(JSON.parse(req.body.events).line));
  }
  res.send("OK");
});

app.post("/webhook", function (req, res) {
  if (
    req.body.events[0].message.type === "text" &&
    req.body.events[0].message.text == "/start"
  ) {
    MongoClient.connect(url, function (err, db) {
      if (err) throw err;
      var dbo = db.db("LineAppDB");
      var myobj = { Flag: true };
      dbo.collection("FlagTable").insertOne(myobj, function (err, res) {
        if (err) throw err;
        db.close();
      });
    });
  }
  if (
    req.body.events[0].message.type === "text" &&
    req.body.events[0].message.text == "/end"
  ) {
    MongoClient.connect(url, function (err, db) {
      if (err) throw err;
      var dbo = db.db("LineAppDB");
      var myobj = { Flag: false };
      dbo.collection("FlagTable").insertOne(myobj, function (err, res) {
        if (err) throw err;
        db.close();
      });
    });
  }

  if (
    req.body.events[0].message.type === "text" &&
    req.body.events[0].message.text == "/throw"
  ) {
    _function.createRandomDice();
  }

  MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("LineAppDB");
    dbo.collection("FlagTable").findOne({ Flag }, function (err, result) {
      if (err) throw err;
      betFlag = result.Flag;
      db.close();
    });
  });

  if (
    req.body.events[0].type === "message" &&
    req.body.events[0].message.type === "text" &&
    betFlag == true
  ) {
    if (
      cmdParse.parser(JSON.parse(req.body.events[0].message.text)) !== false
    ) {
      var flag = cmdParse.parser(JSON.parse(req.body.events[0].message.text));
      var param = {
        text: req.body.events[0].message.text,
        userID: req.body.events[0].source.userID,
        type: flag,
      };
      if (
        flag == "large" ||
        flag == "small" ||
        flag == "odds" ||
        flag == "even" ||
        flag == "single" ||
        flag == "double"
      ) {
        cmd.cmdBet(param);
      }

      if ((flag = "normal")) {
        switch (req.body.events[0].message.text) {
          case "/X":
            cmd.cmdX(param);

          case "/C":
            cmd.cmdC(param);

          case "/A":
            cmd.cmdA(param);

          case "/B":
            cmd.cmdB(param);

          case "/S":
            cmd.cmdS(param);

          case "/Y":
            cmd.cmdY(param);

          case "/N":
            cmd.cmdN(param);
        }
      }
    }
  }

  if (req.body.events[0].type === "memberJoined") {
  }
});

app.listen(PORT, () => {
  console.log(`App listening at http://localhost:${PORT}`);
});