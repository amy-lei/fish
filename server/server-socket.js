let io;

const gameToSocketsMap = {};
const userToSocketMap = {}; // maps user ID to socket object
const socketToUserMap = {}; // maps socket ID to user object

const getAllSocketsFromGame = (key) => { 
  if (key in gameToSocketsMap){ return gameToSocketsMap[key]; } 
  else { return []; } 
}
const getSocketFromSocketID = (socketid) => io.sockets.connected[socketid];

const addUser = (key, socket) => {
  if (key in gameToSocketsMap) {
    gameToSocketsMap[key].push(socket);
  } else {
    gameToSocketsMap[key] = [socket];
  }
};

const removeUser = (user, socket) => {
  if (user) delete userToSocketMap[user._id];
  delete socketToUserMap[socket.id];
};

module.exports = {
  init: (http) => {
    io = require("socket.io")(http);

    io.on("connection", (socket) => {
      console.log(`socket has connected ${socket.id}`);
      socket.on("disconnect", (reason) => {
        // const user = getUserFromSocketID(socket.id);
        // removeUser(user, socket);
      });
    });
  },

  addUser: addUser,
  removeUser: removeUser,
  getSocketFromSocketID: getSocketFromSocketID,
  getAllSocketsFromGame: getAllSocketsFromGame,
  getIo: () => io,
};
