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

// get all chat messages from a given room
router.get("/chat", (req, res) => {
  Message
    .find({key: req.query.room_key})
    .sort({date: 'desc'})
    .then((messages)=> {
      res.send(messages);
    });
});

// post a new message in the chat
router.post("/chat", (req, res) => {
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

// return whether a game with the given key exists
router.post("/check_room", (req, res) => {
    const requested_key = req.body.roomkey;
    Game.find({key: requested_key})
        .then((foundGame) => {
            res.send(foundGame.length === 1);
        });
});

// adds user to existing game or set user to active 
router.post("/join_room", (req, res) => {
    const requestedRoomKey = req.body.room_key;
    const playerName = req.body.playerName;
    Game.findOne({key: requestedRoomKey})
        .then((foundGame) => {
          socket.addUser(foundGame.key, socket.getSocketFromSocketID(req.body.socketid), playerName);
          // joining an ongoing game 
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
            // join the lobby with other players
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
            const newPlayer = {
              name: newPlayerName, 
              index: foundGame.players.length, 
              ready: false, active: true
            };
            foundGame.players.push(newPlayer);
            foundGame
              .save()
              .then((game) => {
                socket.getAllSocketsFromGame(game.key).forEach(client => {
                    client.emit("joinedWaitingRoom", game.players);
                });
                res.send({self: newPlayer, game, return: false})
              });
            
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
            // create a unique 4-digit key
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
      // split deck
      cards = gen_cards(game.players.length);
      game.hands = cards;
      game.start = true;
      // update players 
      for (let player of game.players) {
        player.numOfCards = cards[player.index].length;
      }
      
      game
        .save()
        .then((g) => {
          socket.getAllSocketsFromGame(game.key).forEach(client => {
            client.emit("startGame", { cards, players: g.players });
          });
          res.send(cards);
        });
    });
});

router.post("/ask", (req, res) => {
  const move = {
    type: 'ASK',
    asker: req.body.asker,
    recipient: req.body.recipient,
    card: req.body.card,
  };
  Game
    .findOne({key: req.body.key})
    .then(game => {
      history = game.history;
      if (history.length === 4) history.shift();
      history.push(move);
      game.turnType = 'RESPOND';
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
        card: req.body.card,
    };
    Game
        .findOne({key: req.body.key})
        .then(game => {
            history = game.history;
            if (history.length == 4) history.shift();
            history.push(move);
            
            if (move.success) {
                // remove from responder
                newHand = game.hands[move.responder.index].filter(card => 
                    !(card.rank === move.card.rank && card.suit === move.card.suit));
                game.hands[move.responder.index] = newHand;
                game.players[move.responder.index].numOfCards--;
                if (newHand.length === 0) {
                    game.players[move.responder.index].active = false;
                }
                // add to asker
                game.hands[move.asker.index].push(move.card);
                game.players[move.asker.index].numOfCards++;
                game.whoseTurn = req.body.asker.name;
            } else {
                game.whoseTurn = req.body.responder.name;
            }
            game.turnType = 'ASK';
            game.save()
                .then((g) => {
                    socket.getAllSocketsFromGame(game.key).forEach(client => {
                        client.emit("respond", g);
                    });
                    res.send({});
                });      
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
        client.emit("declared", 
          {guess: req.body.guess, halfSuit: req.body.halfSuit});
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
            
            const updatedHands = [];
            game.hands.forEach((hand, i) => {
                const newHand = removeHalfSuit(hand, req.body.halfSuit);
                updatedHands.push(newHand);
                game.players[i].numOfCards = newHand.length;
                if (newHand.length === 0) {
                    game.players[i].active = false;
                }
            });
            game.hands = updatedHands;
            game.save()
                .then((g) => {
                    socket.getAllSocketsFromGame(req.body.key).forEach((client) => {
                        client.emit("updateScore", {
                          even: req.body.even, 
                          g,
                        });
                      });
                    res.send({});
                });
        });
});

router.post("/out", (req, res) => {
  Game
    .findOne({key:req.body.key})
    .then((game)=>{
      game.hands[req.body.index] = [];
      game.players[req.body.index].active = false;
      const name = game.players[req.body.index].name;

      socket.getAllSocketsFromGame(req.body.key).forEach(client => {
        client.emit("playerOut", {index: req.body.index, name});
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
