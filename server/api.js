const express = require("express");
const Message = require("./models/message.js");
const Game = require("./models/game.js");

// modules for card handling
const gen_cards = require("./cards.js");
const removeHalfSuit = require("./util.js");

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
    console.log(req.body.sender_index);
    const mes = new Message({
        sender_index: req.body.sender_index,
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
    const requested_key = req.body.roomKey;
    Game.find({key: requested_key})
        .then((foundGame) => {
            res.send(foundGame.length === 1);
        });
});

router.post("/join_room", (req, res) => {
    const requestedRoomKey = req.body.room_key;
    const playerName = req.body.playerName;
    console.log(requestedRoomKey);
    Game.findOne({key: requestedRoomKey})
        .then((foundGame) => {
          socket.addUser(foundGame.key, socket.getSocketFromSocketID(req.body.socketid), playerName);
          if (foundGame.start) {
            let targetPlayer;
            for (let player of foundGame.players){
              if (player.name === playerName) {
                targetPlayer = player;
                player.active = true;
                break;
              }
            }
            
            foundGame.save().then(game => {
              res.send({self: targetPlayer, game, return: true, ...g});
            });
          } else {
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
            const newPlayer = {name: newPlayerName, index: foundGame.players.length, ready: false, active: true};
            socket.getAllSocketsFromGame(foundGame.key).forEach(client => {
                client.emit("joinedWaitingRoom", newPlayer);
            });
            foundGame.players.push(newPlayer);
            foundGame.save()
                     .then((game) => res.send({self: newPlayer, game, return: false}));
          }
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
                players: [{name: creatorName, index: 0, ready: true}],
                hands: [],
                start: false,
                whoseTurn: creatorName,
            });
            game.save().then((game) => {
                socket.addUser(roomKey, socket.getSocketFromSocketID(req.body.socketid), creatorName);
                res.send(game);
            })
        });
});

router.post("/ready", (req, res) => {
    const roomKey = req.body.key;
    const name = req.body.playerName;
    Game.findOne({key: roomKey})
        .then((game) => {
            game.players = game.players.map(player => {
                if (player.name === name) {
                    player.ready = req.body.isReady;
                }
                return player;
            });

            socket.getAllSocketsFromGame(roomKey).forEach(client => {
                client.emit("ready", {playerList: game.players, readyPlayer: name, readyState: req.body.isReady});
            });

            game.save()
                .then(() => res.send({}));
        });
});

router.post("/start_game", (req, res) => {
  Game
    .findOne({ key: req.body.key })
    .then((game) => {
      cards = gen_cards(game.players.length);
      game.hands = cards;
      game.start = true;
      socket.getAllSocketsFromGame(game.key).forEach(client => {
        client.emit("startGame", {cards: cards});
      });
      game.save().then(() => res.send(cards));
    });
});

router.post("/ask", (req, res) => {
  const move = {
    type: 'ASK',
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
      game.turnType = "respond";
      game.whoseTurn = req.body.recipient;
      socket.getAllSocketsFromGame(game.key).forEach(client => {
        client.emit("ask", {history: history, move: move});
      });

      game.save().then(() => res.send({}));
    });
});

router.post("/respond", (req, res) => {
  const move = {
    type: 'RESPOND',
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
            game.whoseTurn = req.body.asker.name;
      } else {
        game.whoseTurn = req.body.responder.name;
      }
      game.turnType = "ask";
      game.save().then(()=>res.send({}));      
    })

});

router.post("/pause", (req,res)=> {
    socket.getAllSocketsFromGame(req.body.key).forEach(client => {
        client.emit("declaring", {player: req.body.player});
      });
    res.send({});
});

router.post("/declare", (req, res)=> {
    socket.getAllSocketsFromGame(req.body.key).forEach(client => {
        client.emit("declared", {guess: req.body.guess});
      });
    res.send({});
});

router.post("/vote", (req, res) => {
    socket.getAllSocketsFromGame(req.body.key).forEach(client => {
        client.emit("vote", {agree: req.body.agree, name: req.body.player});
      });
    res.send({});
});

router.post("/score", (req, res)=> {
    Game
        .findOne({key: req.body.key})
        .then((game) => {
            if (req.body.even) game.even += 1;
            else game.odd += 1;
            
            const updatedHands = game.hands.map(hand => removeHalfSuit(hand, req.body.declare));
            game.hands = updatedHands;

            socket.getAllSocketsFromGame(req.body.key).forEach(client => {
                client.emit("updateScore", {
                  even: req.body.even, 
                  declare: req.body.declare,
                  evenScore: game.even,
                  oddScore: game.odd,
                });
              });

            game.save().then((g) => {console.log(g); res.send({})});
        });
});

router.post("/out", (req, res) => {
  Game
    .findOne({key:req.body.key})
    .then((game)=>{
      game.hands[req.body.index] = [];
      game.players[req.body.index].active = false;

      socket.getAllSocketsFromGame(req.body.key).forEach(client => {
        client.emit("playerOut", {index: req.body.index});
      });

      game.save().then((g)=> res.send(g));

    });

});

// anything else falls to this "not found" case
router.all("*", (req, res) => {
  console.log(`API route not found: ${req.method} ${req.url}`);
  res.status(404).send({ msg: "API route not found" });
});

module.exports = router;
