const Message = require("./models/message.js");
const Game = require("./models/game.js");

let io;

const gameToSocketsMap = {};
const userSocketIdToGameKey = {};
const socketToUserMap = {}; // maps socket ID to user name

const getAllSocketsFromGame = (key) => {
  if (key in gameToSocketsMap){ return gameToSocketsMap[key]; } 
  else { return []; } 
};

const getSocketFromSocketID = (socketid) => io.sockets.connected[socketid];

const addUser = (key, socket, name) => {
    if (key in gameToSocketsMap) {
        gameToSocketsMap[key].push(socket);
    } else {
        gameToSocketsMap[key] = [socket];
    }
    socketToUserMap[socket.id] = name;
    userSocketIdToGameKey[socket.id] = key;
};

const removeUser = (socket, key) => {
    delete socketToUserMap[socket.id];
    delete userSocketIdToGameKey[socket.id];
    if (key in gameToSocketsMap) {
        gameToSocketsMap[key] = gameToSocketsMap[key].filter((otherSocket) => otherSocket.id !== socket.id);
    }
};

/*
  Remove player from game and update other players' indices
*/
const updateGamePlayerList = (user, roomKey) => {
  Game.findOne({ key: roomKey })
      .then((game) => {
        let playerList = game.players;
        let targetIndex = 0;
        for (let i = 0; i < playerList.length; i++) {
          if (playerList[i].name === user) {
            targetIndex = i;
            break;
          }
        }
        playerList.splice(targetIndex, 1);
        playerList = playerList.map((player) => {
          if (player.index > targetIndex) {
            player.index -= 1;
          }
          return player;
        });
        game.players = playerList;

        // update turn if creator left 
        if (targetIndex === 0) {
          game.whoseTurn = game.players[0].name;
        }

        game.save();
        getAllSocketsFromGame(roomKey).forEach(client => {
            client.emit("updatedPlayerList", playerList);
        })
      })
};

module.exports = {
    init: (http) => {
        io = require("socket.io")(http);
        io.on("connection", (socket) => {
            console.log(`socket has connected ${socket.id}`);
            socket.on("disconnect", (reason) => {
                const user = socketToUserMap[socket.id];
                const roomKey = userSocketIdToGameKey[socket.id];
                const otherUserSockets = getAllSocketsFromGame(roomKey);
                // delete game if no one left
                if (otherUserSockets.length <= 1) {
                    removeUser(socket, roomKey);
                    delete gameToSocketsMap[roomKey];
                    Game
                        .deleteOne({key: roomKey})
                        .then((game) => console.log("deleted the game with key", roomKey));
                    Message
                        .deleteMany({key: roomKey})
                        .then((messages) => console.log("deleted messages with key", roomKey));
                }
                else {
                    Game
                        .findOne({key: roomKey})
                        .then((g) => {
                            if (g) {
                                otherUserSockets.forEach(client => {
                                    client.emit("disconnected", user);
                                });
                                removeUser(socket, roomKey);
                                // delete player info if disconnected in the lobby 
                                if (!g.start) {
                                    console.log('disconnected in lobby, delete', user);
                                    updateGamePlayerList(user, roomKey);
                                } else {
                                    // otherwise keep their data 
                                    console.log('disconnected mid game, dont delete', user);
                                }
                            }});
                }
            });
        });
    },

    addUser: addUser,
    removeUser: removeUser,
    getSocketFromSocketID: getSocketFromSocketID,
    getAllSocketsFromGame: getAllSocketsFromGame,
    getIo: () => io,
};
