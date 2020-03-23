import React, { Component } from "react";
import "../../utilities.css";
import { post } from "../../utilities";
import { hasCard } from "../../game-utilities";
import { socket } from "../../client-socket";
import { card_svgs } from "../card_svgs.js";

import "../styles/game.scss";
import "../styles/cards.scss";
const SUITS = [
    'heart', 
    'diamond', 
    'spade', 
    'club',
  ];
const JOKER_SUITS = [
    'red',
    'black',
];
const RANKS = [
    'ace',
    'two',
    'three',
    'four',
    'five',
    'six',
    'seven',
    'eight',
    'nine',
    'ten',
    'jack',
    'queen',
    'king',
    'joker',
];
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
            players: this.props.isCreator ? [{name:this.props.name, index:0}] : this.props.roomInfo.players,
        };
    };

    componentDidMount() {
        socket.on("joinedWaitingRoom", (newName) => {
            this.setState({
                players: this.state.players.concat(newName)
            })
        });

        socket.on("startGame", (mes) => {
            this.setUpGame(mes.cards[this.props.index]);
        });
    }

    // TODO: add a ready button for non creators.
    // for now, everyone will have access to the start btn regardless of readiness
    start = async () => {
        const body = {key: this.props.room_key}
        const hands = await post("/api/start_game", body);
    };

    setUpGame = (hand) => {
        let otherTeam = [];
        let yourTeam = [];
        const parity = this.props.index % 2;
        this.state.players.forEach((player) => {
            if (player.index % 2 == parity) yourTeam.push(player);
            else otherTeam.push(player);
        });
        this.props.updateGame(hand, yourTeam, otherTeam);
        this.props.changePage("play_room");

    };

    render() {
        return (
            <div>
                Hi, your name is {this.props.name}. <br/>
                You are player number {this.props.index.toString()} <br/>
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
            </div>
        )
    }
}

class PlayRoom extends Component {
    constructor(props) {
        super(props);
        this.state = {
            asking: false,
            responding: false,
            recipient: "",
            rank: "",
            suit: "",
            response: "",
        };
    }

    // Create ugly cards for now, its too distracting
    createCards = (hand) => {
        return hand.map(card => (
            <div className="test-card">
                {card.rank} {card.suit}
            </div>
            // <div className={`card card-${this.props.hand.length}`}>
            //     <img src={card_svgs[`${card.rank}-${card.suit}.svg`]}/>
            // </div>
        ));
    }

    ask = () => {
        this.props.submitAsk(this.state.recipient, this.state.rank, this.state.suit)
        this.setState({
            asking: false,
            recipient: "",
            rank: "",
            suit: "",
        });
    }

    respond = () => {
        this.props.submitResponse(this.state.response);
        this.setState({
            responding: false,
            response: "",
        });
    }

    render() {
        let cards = "Loading cards";
        if (this.props.hand) {
            // Use fake cards for now–too distracting 
            cards = this.createCards(this.props.hand);
        }

        const askFunc = (
            <>
                <button
                    className="btn"
                    onClick={() => this.setState({asking: true})}
                >
                    ASK!!!!
                </button>
                <div className={`popup ${this.state.asking ? "" : "hidden"}`}>
                    Who
                    <select 
                        value={this.state.recipient} 
                        onChange={(e) => this.setState({recipient: e.target.value})}
                        >
                        <option value=""></option>
                        {this.props.otherTeam.map(player => (
                            <option value={player.name}>{player.name}</option>    
                            ))}
                    </select>

                    Rank
                    <select 
                        value={this.state.rank} 
                        onChange={(e) => this.setState({rank: e.target.value})}
                        >
                        <option value=""></option>
                        {RANKS.map(rank => (
                            <option value={rank}>{rank}</option>
                            ))}
                    </select>

                    {this.state.rank && (
                        <>
                            Suit
                            <select
                                value={this.state.suit}
                                onChange={(e) => this.setState({suit: e.target.value})}
                                >
                                <option value=""></option>
                                { this.state.rank === "joker" ?
                                    JOKER_SUITS.map(suit => (
                                        <option value={suit}>{suit}</option>
                                        ))
                                        : SUITS.map(suit => (
                                            <option value={suit}>{suit}</option>
                                        ))
                                }
                            </select>
                        </>
                    )}
                    {(this.state.recipient && this.state.rank && this.state.suit) &&
                        (<button onClick={this.ask}>Ask</button>)}
                </div>
            </>
        );

        let asker;
        this.props.history.length !== 0 ? asker = this.props.history[this.props.history.length - 1].asker.name : asker = "";
        const respondFunc = (
            <>
                <button onClick={()=>this.setState({responding:true})}>Respond</button>
                <div className={`popup ${this.state.responding?"": "hidden"}`}>
                    Respond to {asker}:
                    <input 
                        type="text"
                        onChange={(e) => this.setState({response: e.target.value})}
                        value={this.state.response}
                    />
                    <button onClick={this.respond}>
                        Send
                    </button>
                </div>
            </>
            );

        return (
            <div>
                Your name: {this.props.name} <br/>
                Player's {this.props.whoseTurn} turn. <br/>
                Turn type: {this.props.turnType}. <br/>
                Your teammates: {
                    this.props.yourTeam.map((player) => 
                    (<span>{player.name}{player.index}</span>))
                } <br/>
                Opposing team: {
                    this.props.otherTeam.map((player) => 
                    (<span>{player.name}{player.index}</span>))
                } <br/>
                {
                    this.props.whoseTurn === this.props.name ?
                        this.props.turnType === "ask" ?
                            askFunc
                            : respondFunc
                        : ""
                }
                <div className="cards">{cards}</div>
            </div>
        );
    }
}


class Game extends Component {
    constructor(props) {
        super(props);
        this.state = {
            page: "home",
            key: "",
            name: "",
            index: "",
            isCreator: "",
            hand: null,
            yourTeam: null,
            otherTeam: null,
            turnType: "ask",
            history: [],
            whoseTurn: "",
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
            socketid: socket.id,
        };
        const game = await post('/api/create_room', body);
        this.setState({
            page: "waiting_room",
            name: name,
            isCreator: true,
            index: 0,
            key: game.key,
            whoseTurn: name,
        });
    };

    enterRoom = async (name) => {
        const body = {
            playerName: name,
            room_key: this.state.key,
            socketid: socket.id,
        };
        const roomInfo = await post('/api/join_room', body);
        this.setState({
            page: "waiting_room",
            name: name,
            isCreator: false,
            index: roomInfo.self.index,
            whoseTurn: roomInfo.info.whoseTurn,
            info: roomInfo.info,
            turnType: roomInfo.info.turnType,
        });
    };
    
    updateGame = (hand, yourTeam, otherTeam) => {
        this.setState({hand, yourTeam, otherTeam});
    }

    ask = async (who, rank, suit) => {
        const body = {
            key: this.state.key,
            asker: { name: this.state.name, index: this.state.index},
            recipient: who, 
            rank: rank,
            suit: suit,
        };
        const res = await post('/api/ask', body);
    }

    respond = async (response) => {
        const lastAsk = this.state.history[this.state.history.length - 1]
        const card = { rank: lastAsk.rank, suit: lastAsk.suit };
        const success = hasCard(this.state.hand, card);
        const body = {
            key: this.state.key,
            responder: {name: this.state.name, index: this.state.index},
            asker: lastAsk.asker,
            response: response,
            success: success,
            card: card,
        };
        await post("/api/respond", body);
    }

    componentDidMount() {
        socket.on("ask", update => {
            this.setState({
                history: update.history,
                whoseTurn: update.move.recipient,
                turnType: "respond",
            });
        });
        socket.on("respond", update => {
            const turn = update.move.success ? update.move.asker.name: update.move.responder.name;
            if (update.move.success) {
                // add to asker/remove from responder
                if (update.move.responder.name === this.state.name) {
                    const hand = this.state.hand.filter(card => 
                        !(card.rank === update.move.rank && card.suit === update.move.suit)); 
                    this.setState({hand})
                } else if (update.move.asker.name === this.state.name) {
                    this.setState({
                        hand: this.state.hand.concat({rank:update.move.rank, suit: update.move.suit}),
                    });
                }
            }
            this.setState({
                history: update.history,
                whoseTurn: turn,
                turnType: "ask",
            });
        });
    }

    render() {
        let history = this.state.history.map(move => {
            if (move.type === "ask")
                return (<div>
                    {move.asker.name} asked {move.recipient} for {move.rank} {move.suit}
                </div>);
            else {
                const result = move.success ? "did" : "did not"
                return (<><div>
                    {move.responder.name} responded with {move.response}
                </div>
                <div>
                    {move.responder.name} {result} have the {move.rank} {move.suit}
                </div><br/></>);
            }
        });
        
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
                    index={this.state.index}
                    isCreator={this.state.isCreator}
                    roomInfo={this.state.info}
                    changePage={this.changePage}
                    updateGame={this.updateGame}
                />
            );
        }
        if (this.state.page === "play_room") {
            return(
                <>
                    Game History: <br/>
                    {history}<br/>
                    <PlayRoom
                        name={this.state.name}
                        index={this.state.index}
                        hand={this.state.hand}
                        yourTeam={this.state.yourTeam}
                        otherTeam={this.state.otherTeam}
                        whoseTurn={this.state.whoseTurn}
                        turnType={this.state.turnType}
                        submitAsk={this.ask}
                        submitResponse={this.respond}
                        history={this.state.history}
                    />
            </>);
        } 
        return (
            <div>Not Found</div>
        );
    };
}

export default Game;