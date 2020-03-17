/*
|--------------------------------------------------------------------------
| server.js -- The core of your server
|--------------------------------------------------------------------------
|
| At a high level, this file does the following things:
| - Connect to the database
| - Sets up server middleware (i.e. addons that eapi.js
| - Fowards frontend routes that should be handled by the React router
| - Sets up error handling in case something goes wrong when handling a request
| - Actually starts the webserver
*/

//import libraries needed for the webserver to work!
const http = require("http");
const express = require("express"); // backend framework for our node server.
const path = require("path"); // provide utilities for working with file and directory paths
const api = require("./api.js");
const mongoose = require("mongoose");

// connect to db 
const connectionURL = "mongodb+srv://admin:May122001@fish-9ui45.mongodb.net/test?retryWrites=true&w=majority";
const dbName = "Fish";
const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  dbName: dbName,
};
mongoose
  .connect(connectionURL, options)
  .then(()=> console.log("Connected to MongoDB!"))
  .catch((err) => console.log(`error connecting to db ${err}`));


// socket stuff
const socket = require("./server-socket");

// create a new express server
const app = express();

// allow us to process POST requests
app.use(express.json());

app.use('/api', api);

// load the compiled react files, which will serve /index.html and /bundle.js
const reactPath = path.resolve(__dirname, "..", "client", "dist");
app.use(express.static(reactPath));

// for all other routes, render index.html and let react router handle it
app.get("*", (req, res) => {
  res.sendFile(path.join(reactPath, "index.html"));
});

// any server errors cause this function to run
app.use((err, req, res, next) => {
  const status = err.status || 500;
  if (status === 500) {
    // 500 means Internal Server Error
    console.log("The server errored when processing a request!");
    console.log(err);
  }

  res.status(status);
  res.send({
    status: status,
    message: err.message,
  });
});

const port = process.env.PORT || 3000;
const server = http.Server(app);
socket.init(server);

server.listen(port, () => {
  console.log(`Server running on port: ${port}`);
});
