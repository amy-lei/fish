import React, { Component, Suspense, lazy } from "react";
import {
  BrowserRouter as Router, 
  Route,
} from "react-router-dom";
import Loading from "./pages/Loading";
import { GlobalStore } from '../context/GlobalContext';
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
      <GlobalStore>
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
      </GlobalStore>
    );
  }
}

export default App;
