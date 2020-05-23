import React, { Component } from "react";
import logo from "../../public/header_logo.svg";
import { post } from "../../utilities";
import { socket } from "../../client-socket";
import { Redirect } from 'react-router'; 
import Chat from "./Chat.js";
import GlobalContext from '../../context/GlobalContext';

const MAX_PLAYERS = 6;
const FACES = [':)', '•_•', '=U','°_o',':O','°Д°'];

// const FAKE_PEOPLE = [
//     {
//         name: 'a',
//         index: 1,
//         ready: true,
//         active: false,
//     },
//     {
//         name: 'b',
//         index: 2,
//         ready: true,
//         active: false,
//     },
//     {
//         name: 'c',
//         index: 3,
//         ready: true,
//         active: true,
//     },
//     {
//         name: 'd',
//         index: 4,
//         ready: true,
//         active: true,
//     },
//     {
//         name: 'e',
//         index: 5,
//         ready: true,
//         active: false,
//     },
// ]

class WaitingRoom extends Component {

    static contextType = GlobalContext;

    constructor(props) {
        super(props);
        this.state = {
            redirect: false,
        };
        this.key_ref = React.createRef();
    };

    componentDidMount() {
        socket.on('startGame', (info) => {
            this.setState({ redirect: true });
        });
    }

    start = async () => {
        const body = {key: this.context.roomkey};
        await post("/api/start_game", body);
    };

    ready = async (isReady) => {
        this.context.toggleReady(isReady);
        const body = {
            key: this.context.roomkey,
            playerName: this.context.name,
            isReady,
        };
        const _ = await post("/api/ready", body);
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
        const {
            name,
            index,
            roomkey, 
            players, 
            isCreator,
            isReady,
        } = this.context;

        // only render if user inputed name and key
        if (!(name || roomkey)) {
            return <Redirect to='/'/>;
        }

        if (this.state.redirect) {
            return <Redirect to='/play'/>;
        }

        const placeholderPlayers = [...Array(6 - players.length).keys()].map((num) => (
            {name: `placeholder${num}`, index: -1, ready: false, active: false}
        ));
        const disableStart = !(players.every(player => player.ready) && players.length === MAX_PLAYERS);
        return (
        <>
            <div className="container">
                <div className='header'>
                    <img className='header-logo logo' src={logo}/>
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
                                className={`btn long-btn ${disableStart ? "disabled-btn" : "primary-btn"}`}
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
                        {players.concat(placeholderPlayers).map((player, k) => (
                            <div key={k} className="player">
                                <div className={`player-img ${player.index === -1 ? 'placeholder' 
                                                            : player.index % 2 === 0 
                                                            ? 'team-even' : 'team-odd'} ${player.name === name && "YOU"}`}
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
            </div>
        </>
        )
    }
}

export default WaitingRoom;