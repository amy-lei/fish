import React, { Component } from "react";
import { post } from "../../utilities";
import { socket } from "../../client-socket";
import Chat from "./Chat.js";

import "../styles/game.scss";
import "../styles/cards.scss";
const FAKE_PP = [
    {name: "A2", active: true, ready: true, index: 1},
    {name: "A3", active: true, ready: true, index: 2},
    {name: "A4", active: false, ready: true, index: 3},
    {name: "A5", active: true, ready: true, index: 4},
    {name: "A6", active: false, ready: true, index: 5},
];

class WaitingRoom extends Component {
    constructor(props) {
        super(props);
        this.state = {
            players: this.props.isCreator ? [{name:this.props.name, index: 0, ready: true, active: true}].concat(FAKE_PP) : FAKE_PP,
            index: this.props.index,
        };
    };

    componentDidMount() {
        // update when someone joins
        socket.on("joinedWaitingRoom", (newName) => {
            this.setState({
                players: this.state.players.concat(newName)
            });
        });

        // update when someone leaves
        socket.on("updatedPlayerList", (list) => {
            this.setState({
                players: list,
                index: list.filter((player) => player.name === this.props.name)[0].index, //gets the new index of the player
            });
        });

        // set up game when someone hits start 
        socket.on("startGame", (info) => {
            this.setUpGame(info.cards[this.state.index]);
        });

        // updates ready/ unready state
        socket.on("ready", (readyInfo) => {
            this.setState({players: readyInfo.playerList});
        });
    }

    // TODO: add a ready button for non creators.
    start = async () => {
        for (let player of this.state.players) {
            if (!player.ready) {
                alert("Not all players are ready!");
                return;
            }
        }
        const body = {key: this.props.roomKey};
        const hands = await post("/api/start_game", body);
        this.setUpGame(hands[this.state.index]);
    };

    ready = async (isReady) => {
        const body = {
            key: this.props.roomKey,
            playerName: this.props.name,
            isReady: isReady,
        };
        const players = await post("/api/ready", body);
        this.setState({players});
    };

    /*
        Split players into team by their index
        and update your hand
     */
    setUpGame = (hand) => {
        let otherTeam = [];
        let yourTeam = [];
        const parity = this.props.index % 2;
        this.state.players.forEach((player) => {
            if (player.index % 2 === parity) yourTeam.push(player);
            else otherTeam.push(player);
        });
        this.props.updateGame(hand, yourTeam, otherTeam);
        this.props.changePage("play_room");

    };

    render() {
        const areYouReady = this.state.players.filter(player => player.name === this.props.name)[0].ready;
        return (
            <div className={"waiting-container"}>
                <div className={"chat-container"}>
                    <div className={"chat-label"}>Chat Room</div>
                    <Chat
                        name={this.props.name}
                        roomKey={this.props.roomKey}
                    />
                </div>
                <div className={"waiting-key-container"}>
                    <div className={"friends-label"}>Share this key with five friends:</div>
                    <div className={"waiting-key"}>{this.props.roomKey}</div>
                    {
                        this.props.isCreator ?
                        <button onClick={this.start} className={"waiting-button"}>
                            Start Game
                        </button>
                        :
                         areYouReady ?
                            <button onClick={() => this.ready(false)} className={"waiting-button"}>
                                Not Ready
                            </button>
                            :
                            <button onClick={() => this.ready(true)} className={"waiting-button"}>
                                Ready
                            </button>
                    }
                    <div className={"players-container"}>
                        {this.state.players.map((player, k) => (
                            <div key={k} className={"player"}>
                                {/*<div className={"circle"}/> force width and height to be the same border if ready    */}
                                <div className={"waiting-player-name"}>{player.name}</div>
                            </div>
                        ))}
                    </div>

                </div>
            </div>
        )
    }
}

export default WaitingRoom;