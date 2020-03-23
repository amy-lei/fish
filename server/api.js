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
const gen_cards = require("./cards.js");
// api endpoints: all these paths will be prefixed with "/api/"
const router = express.Router();

//initialize socket
const socket = require("./server-socket");

router.get("/chat", (req, res) => {
  Message
    .find({})
    .sort({date: 'desc'})
    .then((messages)=> {
      res.send(messages);
    });
});

// TODO: update this to include game key and to 
// only emit to players in this game 
router.post("/chat", (req, res) => {
  const mes = new Message({
    sender_name: req.body.sender_name,
    content: req.body.content,
  });
  mes.save().then((message)=> {
      socket.getIo().emit("newMessage", message);
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
            socket.addUser(foundGame.key, socket.getSocketFromSocketID(req.body.socketid));
            newPlayer = {name: playerName, index: foundGame.players.length};
            socket.getAllSocketsFromGame(foundGame.key).forEach(client => {
              client.emit("joinedWaitingRoom", newPlayer);
            });
            foundGame.players.push(newPlayer);
            foundGame.save();
            // TODO: send back new name if duplicates
            res.send({self: newPlayer, info: foundGame});
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
        players: [{name: req.body.creatorName, index: 0}],
        hands: [],
        whoseTurn: req.body.creatorName,
    });
    game.save().then((game) => {
        socket.addUser(roomKey, socket.getSocketFromSocketID(req.body.socketid));
        res.send(game);
    })
});


router.post("/start_game", (req, res) => {
  Game
    .findOne({ key: req.body.key })
    .then((game) => {
      cards = gen_cards(game.players.length);
      game.hands = cards;
      socket.getAllSocketsFromGame(game.key).forEach(client => {
        client.emit("startGame", {cards: cards});
      });
      game.save().then(() => res.send(cards));
    });
});

router.post("/ask", (req, res) => {
  const move = {
    type: "ask",
    asker: req.body.asker,
    recipient: req.body.recipient,
    rank: req.body.rank,
    suit: req.body.suit,
  };
  Game
    .findOne({key: req.body.key})
    .then(game => {
      history = game.history;
      if (history.length === 4) history.shift();
      history.push(move);
      
      socket.getAllSocketsFromGame(game.key).forEach(client => {
        client.emit("ask", {history: history, move: move});
      });

      game.save().then(()=>res.send());
    });
});

router.post("/respond", (req, res) => {
  const move = {
    type: "respond",
    responder: req.body.responder,
    asker: req.body.asker,
    response: req.body.response,
    success: req.body.success,
    rank: req.body.card.rank,
    suit: req.body.card.suit,
  };
  Game
    .findOne({key: req.body.key})
    .then(game => {
      history = game.history;
      if (history.length == 4) history.shift();
      history.push(move);
      socket.getAllSocketsFromGame(game.key).forEach(client => {
        client.emit("respond", {history: history, move: move});
      });

      if (move.success) {
            // remove from responder
            newHand = game.hands[move.responder.index].filter(card => 
                !(card.rank === move.rank && card.suit === move.suit));
            game.hands[move.responder.index] = newHand;

            // add to asker
            game.hands[move.asker.index].push({rank: move.rank, suit: move.suit});
      }
      game.save().then(()=>res.send({}));      
    })

});

// anything else falls to this "not found" case
router.all("*", (req, res) => {
  console.log(`API route not found: ${req.method} ${req.url}`);
  res.status(404).send({ msg: "API route not found" });
});

module.exports = router;
