/*
|--------------------------------------------------------------------------
| api.js -- server routes
|--------------------------------------------------------------------------
|
| This file defines the routes for your server.
|
*/

const express = require("express");
const Message = require("./models/message.js");
const Game = require("./models/game.js");

// api endpoints: all these paths will be prefixed with "/api/"
const router = express.Router();

//initialize socket
const socket = require("./server-socket");

router.get("/chat", (req, res) => {
  Message
    .find({})
    .sort({date: 'desc'})
    .then((messages)=> {
      console.log(`found: ${messages.length}`);
      res.send(messages);
    });
});

router.post("/chat", (req, res) => {
  const mes = new Message({
    sender_name: req.body.sender_name,
    content: req.body.content,
  });
  mes.save().then((message)=> {
      socket.getIo().emit("newMessage", message);
      console.log(`sent message: ${message}`);
      res.send({'content': message.content});
    });
});

router.post("/check_room", (req, res) => {
    const requested_key = req.body.room_key;
    Game.find({key: requested_key})
        .then((foundGame) => {
            res.send(foundGame.length === 1);
        });
});

router.post("/join_room", (req, res) => {
    const requestedRoomKey = req.body.room_key;
    const playerName = req.body.playerName;
    Game.findOne({key: requestedRoomKey})
        .then((foundGame) => {
            socket.getIo().emit("joinedWaitingRoom", playerName);
            foundGame.players = foundGame.players.concat([playerName]);
            foundGame.save();
            // TODO: send back new name if duplicates
            res.send({players: foundGame.players});
        });
});

router.post("/create_room", (req, res) => {
    // TODO: check that this room key does not already exist
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890";
    let roomKey = "";
    for (let i = 0; i < 4; i++){
        roomKey = roomKey.concat(chars[Math.floor(Math.random() * 36)]);
    }
    const game = new Game({
        key: roomKey,
        players: [req.body.creatorName],
        hands: [],
        teamEven: [],
        teamOdd: [],
    });
    game.save().then((game) => {
        res.send({'content': game});
    })
});


// anything else falls to this "not found" case
router.all("*", (req, res) => {
  console.log(`API route not found: ${req.method} ${req.url}`);
  res.status(404).send({ msg: "API route not found" });
});

module.exports = router;
