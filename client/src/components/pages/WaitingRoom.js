import React, { Component } from "react";
import { post } from "../../utilities";
import { socket } from "../../client-socket";
import Chat from "./Chat.js";

import "../styles/game.scss";
import "../styles/cards.scss";

class WaitingRoom extends Component {
    constructor(props) {
        super(props);
        this.state = {
            players: this.props.isCreator ? [{name:this.props.name, index: 0, active:true}] : this.props.roomInfo.players,
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
    }

    // TODO: add a ready button for non creators.
    start = async () => {
        const body = {key: this.props.room_key};
        const hands = await post("/api/start_game", body);
        this.setUpGame(hands[this.state.index]);
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
        return (
            <div>
                Hi, your name is {this.props.name}. <br/>
                You are player number {this.state.index.toString()} <br/>
                Are you creator? {this.props.isCreator + ""} <br/>
                Room Key: {this.props.room_key} <br/>
                Here are the players in the room and their indices: <br/>
                <ul>
                    {this.state.players.map((player, k) => (
                        <li key={k}>
                            {player.index} {player.name} 
                        </li>
                    ))}
                </ul>
                <button onClick={this.start}>
                    Start Game
                </button>
                <Chat
                    name={this.props.name}
                    room_key={this.props.room_key}
                />
            </div>
        )
    }
}

export default WaitingRoom;