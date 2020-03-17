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


// anything else falls to this "not found" case
router.all("*", (req, res) => {
  console.log(`API route not found: ${req.method} ${req.url}`);
  res.status(404).send({ msg: "API route not found" });
});

module.exports = router;
