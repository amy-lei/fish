import React, { Component } from "react";
import { Redirect } from 'react-router';
import logo from "../../public/logo.svg";
import NameForm from '../modules/NameForm';
import RoomForm from '../modules/RoomForm';
import Help from '../modules/Help'

class Home extends Component {
    constructor(props) {
        super(props);
        this.state = {
            redirect: '',
            isCreator: false,
            view: "room",
            showHelp: false,
        }
    }

    render() {
        if (this.state.redirect !== '') {
            return <Redirect to={`/${this.state.redirect}`}/>
        }
        return (
        <>
            <div className="home">
                <img className="home-logo logo" src={logo}/>
                <div className='home-desc'>
                    <h1 className="home-desc_title">Stay connected <br/> with friends</h1>
                    <p className='home-desc_tagline'>Start your own game or join a friend's using their key!</p>
                    <div className="home-desc_options">
                        {
                            this.state.view === "room"
                            ? <RoomForm
                                changeView={() => this.setState({view: "name"})}
                                updateCreator={() => this.setState({ isCreator: true })}
                            />
                            : <NameForm
                                isCreator={this.state.isCreator}
                                redirect={(room) => this.setState({ redirect: room })}
                                goBack={() => this.setState({ view: "room" })}
                            />
                        }
                    </div>

                </div>
                <button className='help-button' onClick={() => this.setState({ showHelp: true })}>
                    ?
                </button>
                {
                    this.state.showHelp
                    && <Help closeHelp={() => this.setState({ showHelp: false })}/>
                }
                {/* <img className='home-illustration' src={landing_illustration}/> */}
            </div>
        </>)
    }

}

export default Home;