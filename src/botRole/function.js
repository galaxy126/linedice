var MongoClient = require("mongodb").MongoClient;
var url = "mongodb://localhost:27017/";
//Save the results of lottery draws
const saveHistory = () => {};

//Manage the balance
const manageBalance = (param) => {
  if (param.result == "Win") {
    MongoClient.connect(url, function (err, db) {
      if (err) throw err;
      var dbo = db.db("LineAppDB");
      var myobj = { userID: param.userID };
      dbo.collection("UserTable").find(myobj).updateOne(
        { userID: param.userID },
        {
          userID: param.userID,
          betAmount: param.Amount,
        }
      );
    });
  } else {
  }
};

//Seperate the double num
const seperateNum = (num) => {
  var arr = [];
  while (num != 0) {
    arr.push(num % 10);
    num = (num - (num % 10)) / 10;
  }
  return arr;
};

//Generates 3 pictures of dif ferent numbers of dice
const createRandomDice = async () => {
  var random = 0;
  var num = Math.floor(Math.random() * 666);
  var arr = [];
  arr = seperateNum(num);
  random = arr;

  let betInform = {};

  await MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("LineAppDB");
    dbo
      .collection("BetTable")
      .find({})
      .toArray(function (err, result) {
        betInform = result;
        if (err) throw err;
        db.close();
      });
  });

  betInform.map((element, index) => {
    var sum = 0;
    var result = "";
    var Amount = element.betType.includes("/")
      ? element.betType.split("/")[1]
      : element.betType.split("=")[1];
    var type = element.betType.includes("/")
      ? element.betType.split("/")[0]
      : element.betType.split("=")[0];

    if (element.type == "large") {
      random.foreach((e) => {
        sum += e;
      });
      if (sum < 11) {
        Amount = Amount * 2;
        result = "Win";
      } else {
        result = "Lose";
      }

      MongoClient.connect(url, function (err, db) {
        if (err) throw err;
        var dbo = db.db("LineAppDB");
        dbo.collection("BetTable").updateOne(
          { userID: element.userID },
          {
            betType: element.text,
            betAmount: Amount,
            betResult: result,
            userID: element.userID,
          }
        );
      });
    }

    if (element.type == "small") {
      random.foreach((e) => {
        sum += e;
      });
      if (sum > 11) {
        Amount = Amount * 2;
        result = "Win";
      } else {
        result = "Lose";
      }
      MongoClient.connect(url, function (err, db) {
        if (err) throw err;
        var dbo = db.db("LineAppDB");
        dbo.collection("BetTable").updateOne(
          { userID: element.userID },
          {
            betType: element.text,
            betAmount: Amount,
            betResult: result,
            userID: element.userID,
          }
        );
      });
    }

    if (element.type == "odds") {
      random.forEach((element) => {
        if (element % 2 == 0) num++;
      });
      if (num > 0) {
        Amount = Amount * (num + 2);
        result = "Win";
      } else {
        result = "Lose";
      }
      MongoClient.connect(url, function (err, db) {
        if (err) throw err;
        var dbo = db.db("LineAppDB");
        dbo.collection("BetTable").updateOne(
          { userID: element.userID },
          {
            betType: element.text,
            betAmount: Amount,
            betResult: result,
            userID: element.userID,
          }
        );
      });
    }

    if (element.type == "even") {
      random.forEach((element) => {
        if (element % 2 == 1) num++;
      });
      if (num == 0) {
        Amount = Amount * (num + 2);
        result = "Win";
      } else {
        result = "Lose";
      }
      MongoClient.connect(url, function (err, db) {
        if (err) throw err;
        var dbo = db.db("LineAppDB");
        dbo.collection("BetTable").updateOne(
          { userID: element.userID },
          {
            betType: element.text,
            betAmount: Amount,
            betResult: result,
            userID: element.userID,
          }
        );
      });
    }

    if (element.type == "single") {
      random.forEach((element) => {
        if (element == parseInt(type)) num++;
      });
      if (num > 0) {
        Amount = Amount * (num + 2);
        result = "Win";
      } else {
        result = "Lost";
      }
      MongoClient.connect(url, function (err, db) {
        if (err) throw err;
        var dbo = db.db("LineAppDB");
        dbo.collection("BetTable").updateOne(
          { userID: element.userID },
          {
            betType: element.text,
            betAmount: Amount,
            betResult: result,
            userID: element.userID,
          }
        );
      });
    }

    if (element.type == "double") {
      var compareNum = seperateNum(parseInt(type));
      compareNum.forEach((comNum) => {
        if (random.includes(comNum)) num++;
      });

      if (num > 1) {
        result = "Win";
        Amount = Amount * 6;
      } else {
        result = "Lose";
      }

      MongoClient.connect(url, function (err, db) {
        if (err) throw err;
        var dbo = db.db("LineAppDB");
        dbo.collection("BetTable").updateOne(
          { userID: element.userID },
          {
            betType: element.text,
            betAmount: Amount,
            betResult: result,
            userID: element.userID,
          }
        );
      });
    }
  });

  var fectData = {
    result: result,
    userID: element.userID,
    Amount: Amount,
  };

  manageBalance(fectData);
  return arr;
};

module.exports = {
  saveHistory,
  createRandomDice,
};