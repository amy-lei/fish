import React, { Component } from "react";
import { post } from "../../utilities";
import landing_illustration from "../../public/landing_illustration.svg";
import logo from "../../public/logo.svg";
class Home extends Component {
    constructor(props) {
        super(props);
        this.state = {
            roomKey: "",
            wantToJoinRoom: false,
            roomKeyError: false,
        }
    }

    keyChange = (e) => {
        this.setState({
            roomKey: e.target.value.toUpperCase(),
        });
    };

    checkRoom = async (e) => {
        if ((e && e.key !== "Enter") || this.state.roomKey.trim() === "") {
            return;
        }
        const body = {
            roomKey: this.state.roomKey,
        };
        const canJoin = await post("/api/check_room", body);
        if (canJoin) {
            this.props.enterKey(this.state.roomKey);
            this.props.changePage("join_room");
        }
        else {
            this.setState({roomKeyError: true})
        }
    };

    render() {
        return (<>
            <div className="header"> 
                <img className="header-logo logo" src={logo}/>
            </div>
            <div className="home-container">
                <img className="home-illustration" src={landing_illustration}/>
                <p className="home-tagline">Stay connected with your friends through fish!</p>
                <div className="home-options">
                    <button
                        onClick={() => this.props.changePage("create_room")}
                        className="btn primary-btn"
                    >
                        Create a Room
                    </button>
                    <br/>
                    {
                        !this.state.wantToJoinRoom ?
                            <button
                                onClick={() => {this.setState({wantToJoinRoom: true})}}
                                className="btn primary-btn"
                            >
                                Join a Room
                            </button>
                            :
                            <div className={"room-key-wrapper"}>
                                <div className={"room-key-label"}>Enter room key:</div>
                                <input
                                    type="text"
                                    value={this.state.roomKey}
                                    onChange={(e) => this.keyChange(e)}
                                    className="input room-key-input"
                                    maxLength={4}
                                    onKeyPress={(e) => this.checkRoom(e)}
                                />
                                <button onClick={() => this.checkRoom(null)} className={"room-key-submit"}>ENTER</button>
                                {
                                    this.state.roomKeyError &&
                                    <div className="error room-key-error">
                                        The key you entered does not exist. Please try again.
                                    </div>
                                }
                            </div>
                }
                </div>
            </div>
        </>)
    }

}

export default Home;