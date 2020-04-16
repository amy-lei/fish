import React, { Component } from "react";
import { post } from "../../utilities";
import { socket } from "../../client-socket";
import Chat from "./Chat.js";

import "../styles/game.scss";
import "../styles/cards.scss";

const MAX_PLAYERS = 1;
const FACES = [':)', '•_•', '=U','°_o',':O','°Д°']

class WaitingRoom extends Component {
    constructor(props) {
        super(props);
        this.state = {
            players: this.props.isCreator ? [{name:this.props.name, index: 0, ready: true, active: true}] : this.props.roomInfo.players,
            index: this.props.index,
        };
        this.key_ref = React.createRef();
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

    start = async () => {
        if (!this.state.players.every(player => player.ready)) {
            alert("Not all players are ready!");
            return;
        }
        if (this.state.players.length < MAX_PLAYERS) {
            alert(`You need ${MAX_PLAYERS} players to start!`);
            return;
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
        const _ = await post("/api/ready", body);
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

    copyKey = () => {
        // Got this from W3 schools
        const keyText = this.key_ref.current;
        /* Select the text field */
        keyText.select();
        keyText.setSelectionRange(0, 99999); /*For mobile devices*/

        /* Copy the text inside the text field */
        document.execCommand("copy");
    };

    render() {
        const isReady = this.state.players.filter(player => player.name === this.props.name)[0].ready;
        const placeholderPlayers = [...Array(6 - this.state.players.length).keys()].map((num) => (
            {name: `placeholder${num}`, index: -1, ready: false, active: false}
        ));
        const disableStart = !(this.state.players.every(player => player.ready) && this.state.players.length === MAX_PLAYERS);
        return (
        <>
            <div className="container">
                <div className="sidebar chat-container">
                    <div className="sidebar-label" style={{cursor: "default"}}>
                        <div className="sidebar-label_options">Chat History</div>
                    </div>
                    <Chat
                        index={this.props.index}
                        name={this.props.name}
                        roomKey={this.props.roomKey}
                        hidden={false}
                    />
                </div>
                <div className="main-container waiting-room">
                    <div className="waiting-room_top">
                        <div className="waiting-room_label">
                            Share this key with five friends:
                        </div>
                        <div className="waiting-room_key" onClick={this.copyKey}>
                            {this.props.roomKey}
                        </div>
                        <input 
                            type="text" 
                            ref={this.key_ref} 
                            value={this.props.roomKey} 
                            hidden={true} 
                            readOnly
                        />
                        {
                            this.props.isCreator ?
                            <button
                                onClick={this.start}
                                className={`btn long-btn ${disableStart ? "disabled-start" : "primary-btn"}`}
                                disabled={disableStart}
                            >
                                Start Game
                            </button>
                            :
                            isReady ?
                                <button onClick={() => this.ready(false)} className="btn primary-btn long-btn">
                                    Not Ready
                                </button>
                                :
                                <button onClick={() => this.ready(true)} className="btn primary-btn long-btn">
                                    Ready
                                </button>
                        }
                    </div>
                    <div className="waiting-room_players">
                        {this.state.players.concat(placeholderPlayers).map((player, k) => (
                            <div key={k} className="player">
                                <div className={`player-img ${player.index === -1 ? 'placeholder' 
                                                            : player.index % 2 === 0 
                                                            ? 'team-even' : 'team-odd'} ${player.name === this.props.name && "YOU"}`}
                                >
                                    {FACES[player.index]}
                                </div>
                                <div className="player-name">
                                    {player.index === -1 ? "" : player.name}
                                    {player.ready && ' (ready)'}

                                </div>
                            </div>
                        ))}
                    </div>

                </div>
            </div>
        </>
        )
    }
}

export default WaitingRoom;