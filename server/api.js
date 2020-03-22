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

router.post("/join_room", (req, res) => {
    const requested_key = req.body.room_key;
    console.log(requested_key);
    Game.find({key: requested_key})
        .then((found_game) => {
            res.send(found_game.length !== 0);
        });

});

router.post("/create_room", (req, res) => {
    // TODO: check that this room key does not already exist
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890";
    let room_key = "";
    for (let i = 0; i < 4; i++){
        room_key = room_key.concat(chars[Math.floor(Math.random() * 36)]);
    }
    const game = new Game({
        key: room_key,
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
