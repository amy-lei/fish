import React, { Component } from "react";
import { post } from "../../utilities";
import { connect } from 'react-redux';
import { submitName } from '../../actions/userActions';
import { setRoomKey } from '../../actions/gameActions';

import landing_illustration from "../../public/landing_illustration.svg";

class RoomForm extends Component {
    constructor(props) {
        super(props);
        this.state = {
            roomKey: "",
            wantToJoinRoom: false,
            roomKeyError: false,
        };
    }

    createRoom = () => {
        this.props.changeView();
        this.props.updateCreator();
    }

    keyChange = (e) => {
        this.setState({
            roomKey: e.target.value.toUpperCase(),
        });
    };

    checkRoom = async (e) => {
        if ((e && e.key !== "Enter") || this.state.roomKey.trim() === "") { return; }
        
        const body = {
            roomKey: this.state.roomKey,
        };
        const canJoin = await post("/api/check_room", body);
        if (canJoin) {
            this.props.setRoomKey(this.state.roomKey);
            this.props.changeView();
        }
        else {
            this.setState({roomKeyError: true})
        }
    };

    render() {
        return (<>
            <button
                onClick={this.createRoom}
                className="btn primary-btn long-btn"
            >
                Create a Room
            </button>
            { !this.state.wantToJoinRoom ?
                <button
                    onClick={() => {this.setState({wantToJoinRoom: true})}}
                    className="btn primary-btn long-btn"
                >
                    Join a Room
                </button>
                :
                <div className="input-btn-wrapper room-key-field">
                    <input
                        className="input-btn-field room-key-input"
                        type="text"
                        value={this.state.roomKey}
                        maxLength={4}
                        placeholder="Enter room key"
                        onChange={(e) => this.keyChange(e)}
                        onKeyPress={(e) => this.checkRoom(e)}
                    />
                    <button 
                        onClick={() => this.checkRoom(null)} 
                        className={"btn primary-inverted-btn input-btn-submit"}
                    >
                        Enter
                    </button>
                    {
                        this.state.roomKeyError &&
                        <div className="warning">
                            The key you entered does not exist
                        </div>
                    }
                </div>
            }
        </>)
    }
}

class NameForm extends Component {
    constructor(props) {
        super(props);
        this.state = {
            name: "",
            clickedButton: false,
        };
    };

    nameChange = (e) => {
        this.setState({
            name: e.target.value.toUpperCase(),
        });
    };

    submitName = (e) => {
        if (this.state.clickedButton || this.state.name.trim() === "") {
            return;
        }
        if (!e || e.key === "Enter") {
            this.setState({clickedButton: true}, () => this.props.enterRoom(this.state.name));
            ;
        }
    };


    render() {
        return (
            <>
                <div className="name-label">Enter your name:</div>
                <div className="input-btn-wrapper name">
                    <input
                        type="text"
                        onChange={this.nameChange}
                        value={this.state.name}
                        className="input-btn-field"
                        maxLength={10}
                        onKeyPress={(e) => this.submitName(e)}
                    />
                    <button
                        onClick={() => this.submitName(null)}
                        className={`btn primary-inverted-btn input-btn-submit ${this.state.clickedButton ? "disabled-name" : ""}`}
                        disabled={this.state.clickedButton}
                    >
                        Join
                    </button>
                </div>
            </>
        )
    }
}


class Home extends Component {
    constructor(props) {
        super(props);
        this.state = {
            view: "room",
            isCreator: false,
            roomkey: "",
        }
    }

    render() {
        return (<>
            <div className="home">
                <img className="home-illustration" src={landing_illustration}/>
                <p className="home-tagline">Stay connected with your friends through fish!</p>
                <div className="home-options">
                    {
                        this.state.view === "room"
                        ? <RoomForm
                            setRoomKey={this.props.setRoomKey}
                            changeView={() => this.setState({view: "name"})}
                            updateCreator={() => this.setState({ isCreator: true })}
                        />
                        : <NameForm
                            enterRoom={this.props.enterRoom}
                            submitName={this.props.submitName}
                        />
                    }
                </div>
            </div>
        </>)
    }

}

export default connect(null, { setRoomKey })(Home);