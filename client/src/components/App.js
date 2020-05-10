import React, { Component } from "react";
import Game from "./pages/Game.js";
import store from '../store';
import { Provider } from 'react-redux';

import './styles/App.scss';

/**
 * Define the "App" component as a class.
 */
class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
    };
  }

  render() {
    return (
      <Provider store={store}>
        <Game/>
      </Provider>
    );
  }
}

export default App;
