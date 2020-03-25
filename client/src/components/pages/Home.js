import React, { Component } from "react";
import { post } from "../../utilities";

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

    checkRoom = async () => {
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
        return (
            <div className={"home-container"}>
                <p className={"title"}>fish</p>
                <button
                    onClick={() => this.props.changePage("create_room")}
                    className={"home-button"}
                >
                    Create a Room
                </button>
                <br/>
                {
                    !this.state.wantToJoinRoom ?
                        <button
                            onClick={() => {this.setState({wantToJoinRoom: true})}}
                            className={"home-button"}
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
                                className={"room-key-input"}
                                maxLength={4}
                            />
                            <button onClick={this.checkRoom} className={"room-key-submit"}>ENTER</button>
                            {
                                this.state.roomKeyError &&
                                <div className={"room-key-error"}>
                                    The key you entered does not exist. Please try again
                                </div>
                            }
                        </div>
                }
            </div>
        )
    }

}

export default Home;