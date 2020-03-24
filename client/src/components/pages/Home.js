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
            <>
                <h1>Online Fish</h1>
                <button onClick={() => this.props.changePage("create_room")}>Create a Room</button>
                <button onClick={() => {this.setState({wantToJoinRoom: true})}}>Join a Room</button>
                {
                    this.state.wantToJoinRoom &&
                    <>
                        Key:
                        <input
                            type="text"
                            value={this.state.roomKey}
                            onChange={(e) => this.keyChange(e)}
                        />
                        {this.state.roomKeyError && <span>The key you entered does not exist. Please try again</span>}
                        <button onClick={this.checkRoom}>Join Game!</button>
                    </>
                }
            </>
        )
    }

}

export default Home;