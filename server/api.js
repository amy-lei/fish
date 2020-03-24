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
    .find({key: req.query.room_key})
    .sort({date: 'desc'})
    .then((messages)=> {
      res.send(messages);
    });
});

router.post("/chat", (req, res) => {
    const mes = new Message({
        sender_name: req.body.sender_name,
        content: req.body.content,
        key: req.body.room_key,
    });
    mes.save().then((message)=> {
        socket.getAllSocketsFromGame(req.body.room_key).forEach(client => {
            client.emit("newMessage", message);
        });
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
            socket.addUser(foundGame.key, socket.getSocketFromSocketID(req.body.socketid), playerName);
            const allPlayerNames = foundGame.players.map((player) => player.name);
            let newPlayerName = playerName;
            for (let i = 2; i < 7; i++) {
                if (!allPlayerNames.includes(newPlayerName)) {
                    break;
                }
                else {
                    newPlayerName = playerName + `${i}`;
                }
            }
            const newPlayer = {name: newPlayerName, index: foundGame.players.length};
            socket.getAllSocketsFromGame(foundGame.key).forEach(client => {
                client.emit("joinedWaitingRoom", newPlayer);
            });
            foundGame.players.push(newPlayer);
            foundGame.save();
            res.send({self: newPlayer, players: foundGame.players});
        });
});


router.post("/create_room", (req, res) => {
    const creatorName = req.body.creatorName;
    Game.find({})
        .then((games) => {
            const existingRoomKeys = games.map((game) => game.key);
            const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890";
            let roomKey = "";
            while (true) {
                for (let i = 0; i < 4; i++){
                    roomKey = roomKey.concat(chars[Math.floor(Math.random() * 36)]);
                }
                if (!existingRoomKeys.includes(roomKey)) {
                    break;
                }
                roomKey = "";
            }
            const game = new Game({
                key: roomKey,
                players: [{name: creatorName, index: 0}],
                hands: [],
            });
            game.save().then((game) => {
                socket.addUser(roomKey, socket.getSocketFromSocketID(req.body.socketid), creatorName);
                res.send(game);
            })
        });
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

// anything else falls to this "not found" case
router.all("*", (req, res) => {
  console.log(`API route not found: ${req.method} ${req.url}`);
  res.status(404).send({ msg: "API route not found" });
});

module.exports = router;
