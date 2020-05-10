import React, { Component, Suspense, lazy } from "react";
import {
  BrowserRouter as Router, 
  Route,
} from "react-router-dom";
import store from '../store';
import { Provider } from 'react-redux';

import Header from "./modules/Header.js";
import Loading from "./pages/Loading";
import './styles/App.scss';

const Home = lazy(() => import('./pages/Home'));
const WaitingRoom = lazy(() => import('./pages/WaitingRoom'));
const PlayRoom = lazy(() => import('./pages/PlayRoom'));

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
          <Suspense fallback={Loading}>
            <Route 
              exact path='/' 
              component={Home}
            />
            <Route 
              path='/lobby' 
              component={WaitingRoom}
            />
            <Route 
              path='/play' 
              component={PlayRoom}
            />
          </Suspense>
        </Router>
      </Provider>
    );
  }
}

export default App;
