import React, { Component } from "react";
import TestDrag from "./pages/TestDrag.js";
import Home from "./pages/Home.js"
import {
  BrowserRouter as Router, 
  Switch,
  Route,
  Link,
} from "react-router-dom";
import store from '../store';
import { Provider } from 'react-redux';

import './styles/App.scss';
import Header from "./modules/Header.js";

/**
 * Define the "App" component as a class.
 */
class App extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    return (
      <Provider store={store}>
        <Header/>
        <Router>
          <Route exact path='/' component={Home}/>
          <Route exact path='/lobby' component={TestDrag}/>
          <Route path='/play' component={TestDrag}/>
        </Router>
      </Provider>
    );
  }
}

export default App;
