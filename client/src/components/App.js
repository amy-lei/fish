import React, { Component } from "react";
import NotFound from "./pages/NotFound.js";
import Game from "./pages/Game.js";

import "../utilities.css";
import "./styles/cards.scss";
import { cards } from "./card_objs.js";
import { card_svgs } from "./card_svgs.js";
import { socket } from "../client-socket.js";

import { get, post } from "../utilities";

/**
 * Define the "App" component as a class.
 */
class App extends Component {
  // makes props available in this component
  constructor(props) {
    super(props);
    this.state = {
      userId: undefined,
      numCards: 20, // hardcoded for now!!!
    };
  }

  render() {
    let hand = [];
    for(let i = 0; i < this.state.numCards; i++) {
      const i = Math.floor(Math.random() * 53);
      hand.push(
        <div className={`card card-${this.state.numCards}`}>
          <img src={card_svgs[`${cards[i].rank}-${cards[i].suit}.svg`]}/>
        </div>
        );
    }
    return (
      <>
        <Game/>
      </>
    );
  }
}

export default App;
