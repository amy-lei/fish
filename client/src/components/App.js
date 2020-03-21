import React, { Component } from "react";
import { Router } from "@reach/router";
import NotFound from "./pages/NotFound.js";
import Chat from "./pages/Chat.js";

import "../utilities.css";
import "./styles/cards.scss";
import { images } from "./cards.js";
import { socket } from "../client-socket.js";

import { get, post } from "../utilities";

const SUITS = [
  'heart', 
  'diamond', 
  'spade', 
  'club',
];
const RANKS = [
  'ace',
  'two',
  'three',
  'four',
  'five',
  'six',
  'seven',
  'eight',
  'nine',
  'ten',
  'jack',
  'queen',
  'king',
];

/**
 * Define the "App" component as a class.
 */
class App extends Component {
  // makes props available in this component
  constructor(props) {
    super(props);
    this.state = {
      userId: undefined,
    };
  }

  // componentDidMount() {
  //   get("/api/whoami").then((user) => {
  //     if (user._id) {
  //       // they are registed in the database, and currently logged in.
  //       this.setState({ userId: user._id });
  //     }
  //   });
  // }

  // handleLogin = (res) => {
  //   console.log(`Logged in as ${res.profileObj.name}`);
  //   const userToken = res.tokenObj.id_token;
  //   post("/api/login", { token: userToken }).then((user) => {
  //     this.setState({ userId: user._id });
  //     post("/api/initsocket", { socketid: socket.id });
  //   });
  // };

  // handleLogout = () => {
  //   this.setState({ userId: undefined });
  //   post("/api/logout");
  // };

  render() {
    let cards = [];
    // SUITS.forEach(suit => {
    //   RANKS.forEach(rank => {
    //     cards.push(
    //       (<div className={`card card-${rank}-${suit}`}></div>)
    //     );
    //   });
    // });

    // cards.sort(() => Math.random() - 0.5);
    for(let i = 0; i < 1; i++) {
      cards.push(
        <div className="card">
          <img src={images['ace-heart.svg']}/>
        </div>
        );
    }
    console.log(images);
    return (
      <>
        {/* <Router>
          <Chat
            path="/"
          />
          <NotFound default />
        </Router> */}
        <div className="cards">
          {/* {cards.slice(0,6)} */}
          {cards}
        </div>

      </>
    );
  }
}

export default App;
