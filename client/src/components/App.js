import React, { Component } from "react";
import NotFound from "./pages/NotFound.js";
import Game from "./pages/Game.js";

import "../utilities.css";
import "./styles/cards.scss";
import { cards } from "./cards.js";
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
      numCards: 20, // hardcoded for now!!!
    };
  }

  render() {
    // hardcoded hand for now!!
    let hand = [];
    for(let i = 0; i < this.state.numCards; i++) {
      const rank = Math.floor(Math.random() * 12);
      const suit = Math.floor(Math.random() * 3);
      hand.push(
        <div className={`card card-${this.state.numCards}`}>
          <img src={cards[`${RANKS[rank]}-${SUITS[suit]}.svg`]}/>
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
