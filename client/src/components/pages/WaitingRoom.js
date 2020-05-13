import React, { Component } from "react";
import Header from '../modules/Header';
import { post } from "../../utilities";
import { socket } from "../../client-socket";
import { connect } from 'react-redux';
import { 
    setHand,
    setTeams,
 } from '../../actions/gameActions';
import { Redirect } from 'react-router'; 
import Chat from "./Chat.js";

const MAX_PLAYERS = 1;
const FACES = [':)', '•_•', '=U','°_o',':O','°Д°'];

class WaitingRoom extends Component {
    constructor(props) {
        super(props);
        this.state = {
            redirect: false,
            isReady: false,
            players: this.props.isCreator ? [{name:this.props.name, index: 0, ready: true, active: true}] : this.props.players,
            index: this.props.index,
        };
        this.key_ref = React.createRef();
    };

    componentDidMount() {
        const { index, players } = this.state;

        // update when someone joins
        socket.on("joinedWaitingRoom", (newName) => {
            this.setState({
                players: players.concat(newName)
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
            this.props.setHand(info.cards[index || 0]);
            this.setUpGame();
            this.setState({ redirect: true });
        });

        // updates ready or unready state
        socket.on("ready", (readyInfo) => {
            this.setState({players: readyInfo.playerList});
        });
    }

    start = async () => {
        const body = {key: this.props.roomkey};
        await post("/api/start_game", body);
        this.setUpGame();
    };

    ready = async (isReady) => {
        this.setState({ isReady });
        const body = {
            key: this.props.roomkey,
            playerName: this.props.name,
            isReady,
        };
        const _ = await post("/api/ready", body);
    };

    /*
        Split players into team by their index
        and update your hand
     */
    setUpGame = () => {
        let otherTeam = [];
        let yourTeam = [];
        const parity = this.state.index % 2;
        this.state.players.forEach((player) => {
            if (player.index % 2 === parity) yourTeam.push(player);
            else otherTeam.push(player);
        });
        this.props.setTeams(yourTeam, otherTeam);

    };

    copyKey = () => {
        // Got this from W3 schools
        const keyText = this.key_ref.current;
        keyText.select(); // select the text field 
        keyText.setSelectionRange(0, 99999); // for mobile devices

        // copy the text inside the text field
        document.execCommand("copy");
    };

    render() {
        // only render if user inputed name and key
        if (!(this.props.name || this.props.roomkey)) {
            return <Redirect to='/'/>;
        }

        if (this.state.redirect) {
            return <Redirect to='/play'/>;
        }

        const {
            name,
            roomkey,
            isCreator,
        } = this.props;

        const {
            index,
            isReady,
            players
        } = this.state;

        const placeholderPlayers = [...Array(6 - players.length).keys()].map((num) => (
            {name: `placeholder${num}`, index: -1, ready: false, active: false}
        ));
        const disableStart = !(players.every(player => player.ready) && players.length === MAX_PLAYERS);
        return (
        <>
            <Header gameBegan={false} winner=''/>
            <div className="container">
                <div className="sidebar chat-container">
                    <div className="sidebar-label" style={{cursor: "default"}}>
                        <div className="sidebar-label_options">Chat History</div>
                    </div>
                    <Chat
                        index={index}
                        name={name}
                        roomkey={roomkey}
                        hidden={false}
                    />
                </div>
                <div className="main-container waiting-room">
                    <div className="waiting-room_top">
                        <div className="waiting-room_label">
                            Share this key with five friends:
                        </div>
                        <div className="waiting-room_key" onClick={this.copyKey}>
                            {roomkey}
                        </div>
                        <input 
                            type="text" 
                            ref={this.key_ref} 
                            value={roomkey} 
                            hidden={true} 
                            readOnly
                        />
                        {
                            isCreator ?
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

const mapStateToProps = (state) => ({
    name: state.user.name,
    index: state.user.index,
    isCreator: state.user.isCreator,
    roomkey: state.roomkey,
    players: state.players,
});

const mapDispatchToProps = {
    setHand,
    setTeams,
};

export default connect(mapStateToProps, mapDispatchToProps)(WaitingRoom);