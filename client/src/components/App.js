import React, { Component } from "react";
import TestDrag from "./pages/TestDrag.js";
import Home from "./pages/Home.js"
import NotFound from "./pages/NotFound.js";
import Game from "./pages/Game.js";
import {
  BrowserRouter as Router, 
  Switch,
  Route,
  Link,
} from "react-router-dom";

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
    return (
      <Router>
        <Route exact path='/' component={Home}/>
        <Route exact path='/:roomkey' component={TestDrag}/>
        <Route path='/:roomkey/play' component={TestDrag}/>
        {/* <Game/> */}
      </Router>
    );
  }
}

export default App;
