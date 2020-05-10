import React, { Component } from "react";
import { post } from "../../utilities";
import { Redirect } from 'react-router';

import NameForm from '../modules/NameForm';
import RoomForm from '../modules/RoomForm';
import landing_illustration from "../../public/landing_illustration.svg";

class Home extends Component {
    constructor(props) {
        super(props);
        this.state = {
            redirect: false,
            isCreator: false,
            view: "room",
        }
    }

    render() {
        if (this.state.redirect) {
            return <Redirect to='/lobby'/>
        }
        return (<>
            <div className="home">
                <img className="home-illustration" src={landing_illustration}/>
                <p className="home-tagline">Stay connected with your friends through fish!</p>
                <div className="home-options">
                    {
                        this.state.view === "room"
                        ? <RoomForm
                            changeView={() => this.setState({view: "name"})}
                            updateCreator={() => this.setState({ isCreator: true })}
                        />
                        : <NameForm
                            isCreator={this.state.isCreator}
                            redirect={() => this.setState({ redirect: true })}
                        />
                    }
                </div>
            </div>
        </>)
    }

}

export default Home;