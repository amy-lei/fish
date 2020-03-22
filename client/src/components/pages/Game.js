import React, { Component } from "react";
import "../../utilities.css";
import {post} from "../../utilities";
import { socket } from "../../client-socket";

class Home extends Component {
    constructor(props) {
        super(props);
        this.state = {
            room_key: "",
            want_to_join_room: false,
            room_key_error: false,
        }
    }

    keyChange = (e) => {
        this.setState({
            room_key: e.target.value.toUpperCase(),
        });
    };

    checkRoom = async () => {
        const body = {
            room_key: this.state.room_key,
        };
        const canJoin = await post("/api/check_room", body);
        if (canJoin) {
            this.props.enterKey(this.state.room_key);
            this.props.changePage("join_room");
        }
        else {
            this.setState({room_key_error: true})
        }
    };

    render() {
        return (
            <>
                <h1>Online Fish</h1>
                <button onClick={() => this.props.changePage("create_room")}>Create a Room</button>
                <button onClick={() => {this.setState({want_to_join_room: true})}}>Join a Room</button>
                {
                    this.state.want_to_join_room &&
                    <>
                        Key:
                        <input
                            type="text"
                            value={this.state.room_key}
                            onChange={(e) => this.keyChange(e)}
                        />
                        {this.state.room_key_error && <span>The key you entered does not exist. Please try again</span>}
                        <button onClick={this.checkRoom}>Join Game!</button>
                    </>
                }
            </>
        )
    }

}

class NameForm extends Component {
    constructor(props) {
        super(props);
        this.state = {
            name:""
        };
    };

    nameChange = (e) => {
        this.setState({
            name: e.target.value.toUpperCase(),
        });
    };


    render() {
        return (
            <div>
                Name:
                <input
                    type="text"
                    onChange={this.nameChange}
                    value={this.state.name}
                />
                <br/>
                <button onClick={() => this.props.enterRoom(this.state.name)}>
                    Enter Room
                </button>
            </div>
        )
    }
}

class NameFormCreator extends Component {
    constructor(props) {
        super(props);
        this.state = {
            name:""
        };
    };

    nameChange = (e) => {
        this.setState({
            name: e.target.value.toUpperCase(),
        });
    };


    render() {
        return (
            <div>
                Name:
                <input
                    type="text"
                    onChange={this.nameChange}
                    value={this.state.name}
                />
                <br/>
                <button onClick={() => this.props.createRoom(this.state.name)}>
                    Enter Room
                </button>
            </div>
        )
    }
}

class WaitingRoom extends Component {
    constructor(props) {
        super(props);
        this.state = {
            players: this.props.isCreator ? [this.props.name] : this.props.roomInfo.players,
        };
    };

    componentDidMount() {
        socket.on("joinedWaitingRoom", (newName) => {
            this.setState({
                players: this.state.players.concat(newName)
            })
        })
    }

    render() {
        return (
            <div>
                Hi, your name is {this.props.name}. <br/>
                Are you creator? {this.props.isCreator + ""} <br/>
                Room Key: {this.props.room_key} <br/>
                Here are the players in the room: <br/>
                <ul>
                    {this.state.players.map((player, k) => (
                        <li key={k}>
                            {player}
                        </li>
                    ))}
                </ul>
            </div>
        )
    }
}


class Game extends Component {
    constructor(props) {
        super(props);
        this.state = {
            page: "home",
            key: "",
            name: "",
            isCreator: "",
            info: null,
        };
    };

    changePage = (page) => {
        this.setState({page});
    };

    updateKey = (key) => {
        this.setState({key})
    };

    createRoom = async (name) => {
        const body = {
            creatorName: name,
        };
        const game = await post('/api/create_room', body);
        this.setState({
            page: "waiting_room",
            name: name,
            isCreator: true,
            key: game.content.key,
        });
    };

    enterRoom = async (name) => {
        const body = {
            playerName: name,
            room_key: this.state.key,
        };
        const roomInfo = await post('/api/join_room', body);
        this.setState({
            page: "waiting_room",
            name: name,
            isCreator: false,
            info: roomInfo,
        })
    };
    
    render() {
        if (this.state.page === "home") {
            return (
                <Home changePage={this.changePage} enterKey={this.updateKey}/>
            );
        }
        if (this.state.page === "create_room") {
            return (
                <NameFormCreator createRoom={this.createRoom}/>
            );
        }
        if (this.state.page === "join_room") {
            return (
                <NameForm enterRoom={this.enterRoom}/>
            );
        }
        if (this.state.page === "waiting_room") {
            return (
                <WaitingRoom
                    room_key={this.state.key}
                    name={this.state.name}
                    isCreator={this.state.isCreator}
                    roomInfo={this.state.info}
                />
            );
        }
        return (
            <div>Not Found</div>
        );
    };
}

export default Game;