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

const updateGamePlayerList = (user, roomKey) => {
  Game.findOne({key: roomKey})
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
        removeUser(socket, roomKey);

        const otherUserSockets = getAllSocketsFromGame(roomKey);
        // When there are no more users left in a room, delete the room and all messages associated with the room.
        if (otherUserSockets.length === 0) {
          delete gameToSocketsMap[roomKey];
          Game.deleteOne({key: roomKey})
              .then((game) => console.log("deleted the game with key", roomKey));
          Message.deleteMany({key: roomKey})
              .then((messages) => console.log("deleted messages with key", roomKey));
        }
        // When there are still users in the room, remove the one that disconnected from database
        else {
          updateGamePlayerList(user, roomKey);
          otherUserSockets.forEach(client => {
            client.emit("disconnected", user);
          })
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
