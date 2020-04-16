import React, { Component } from "react";
import { post } from "../../utilities";
import landing_illustration from "../../public/landing_illustration.svg";
import Header from "../modules/Header";
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
        if ((e && e.key !== "Enter") || this.state.roomKey.trim() === "") { return; }
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
            <Header/>
            <div className="home-container">
                <img className="home-illustration" src={landing_illustration}/>
                <p className="home-tagline">Stay connected with your friends through fish!</p>
                <div className="home-options">
                    <button
                        onClick={() => this.props.changePage("create_room")}
                        className="btn primary-btn long-btn"
                    >
                        Create a Room
                    </button>
                    <br/>
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
                                type="text"
                                value={this.state.roomKey}
                                onChange={(e) => this.keyChange(e)}
                                className="input-btn-field room-key-input"
                                maxLength={4}
                                placeholder="Enter room key"
                                onKeyPress={(e) => this.checkRoom(e)}
                            />
                            <button onClick={() => this.checkRoom(null)} className={"btn primary-inverted-btn input-btn-submit"}>Enter</button>
                            {
                                this.state.roomKeyError &&
                                <div className="warning">
                                    The key you entered does not exist
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