import React, { Component } from "react";
import "../../utilities.css";
import { post } from "../../utilities";
import { 
    isValidAsk, 
    isValidDeclare, 
    canObject, 
    removeHalfSuit, 
} from "../../game-utilities";
import { socket } from "../../client-socket";
import Chat from "./Chat.js";
import GuessInput from "../modules/GuessInput.js";
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

class Declare extends Component {
    constructor(props){
        super(props);
        this.state = {
            guess: [],
            invalid: false,
        };
    }

    // validate the declare before announcing 
    confirm = async () => {
        if (isValidDeclare(this.state.guess)) {
            this.setState({invalid: false,});
            await post("/api/declare", {guess: this.state.guess, key: this.props.roomKey});

        } else {
            this.setState({invalid: true,});
        }
    }

    componentDidMount() {
        let guess = [];
        for (let i = 0; i< 6; i++) {
            guess.push({player: "", rank: "", suit: ""});
        }
        this.setState({guess});
    }

    updateGuess = (index, val) => {

    }
    
    render() {
        let inputs;
        if (this.state.guess) {
            inputs = this.state.guess.map((info, i) => 
            <GuessInput
                key={i}
                players={this.props.yourTeam.filter(player => player.active)}
                who={this.state.guess[i].player}
                rank={this.state.guess[i].rank}
                suit={this.state.guess[i].suit}
                updateWho={(val) => {
                    let cur = this.state.guess;
                    cur[i].player = val;
                    this.setState({guess: cur});
                }}
                updateRank={(val) => {
                    let cur = this.state.guess;
                    cur[i].rank = val;
                    this.setState({guess: cur});
                }}
                updateSuit={(val) => {
                    let cur = this.state.guess;
                    cur[i].suit = val;
                    this.setState({guess: cur});
                }}
                validate={() => true}
                
            />)
        }
        return(            
            <div className="popup">
                {inputs}
            <button onClick={this.confirm}>
                Declare
            </button>
            {this.state.invalid && "invalid declare!!!"}
            </div>);

    }
 }

class PlayRoom extends Component {
    constructor(props) {
        super(props);
        this.state = {
            asking: false,
            responding: false,
            declaring: false,
            showDeclare: false, 
            invalid: false,
            recipient: "",
            rank: "",
            suit: "",
            response: "",
            declarer: "",
            guess: null,
            lie: false,
            voted: false,
            votes: [],
            ongoing: true,
            winner: null,
        };
    }

    /*
     visualize your current hand
     */
    createCards = (hand) => {
        return hand.map(card => (
            <div className="test-card">
                {card.rank} {card.suit}
            </div>
            // <div className={`card card-${this.props.hand.length}`}>
            //     <img src={card_svgs[`${card.rank}-${card.suit}.svg`]}/>
            // </div>
        ));
    };

    /*  
        Validate ask before posting,
        and reset states related to ask
    */
    ask = () => {
        if (isValidAsk(this.props.hand, {rank: this.state.rank, suit: this.state.suit})) {
            this.props.submitAsk(this.state.recipient, this.state.rank, this.state.suit)
            this.setState({
                invalid: false,
                asking: false,
                recipient: "",
                rank: "",
                suit: "",
            });
        } else this.setState({invalid: true});
    }

    /*
        Submit response
        and reset states related to respond
     */
    respond = () => {
        this.props.submitResponse(this.state.response);
        this.setState({
            responding: false,
            response: "",
        });
    }

    /*
        STEP 0 of declaring: 

        Alert other players that you are declaring
        to pause them from asking/responding
     */
    declaring = () => {
        this.setState({
            declaring: true,
            showDeclare: false,
            declarer: this.props.name,
        });

        const res = post("/api/pause", {key: this.props.roomKey, player: this.props.name});
    }

    /*
        STEP 1 of declaring: 

        Submit your response to the declare
        and alert others. 
        If OBJECT, validate the objection first
     */
    resToDeclare = async (bool) => {
        const body = {
            key: this.props.roomKey,
            player: this.props.name, 
            agree: bool,
        };
        if (bool) await post("/api/vote", body);
        else {
            // validate objections first
            if (canObject(this.props.hand, this.state.guess, this.props.name)){
                await post("/api/vote", body);
                this.setState({lie: false});
            } 
            else this.setState({lie:true}); 
        }
    }

    /*
        STEP 2 of declaring:

        Once everyone has voted, check for any objections
        (which results in other team gaining the point). 
        Announce results.

     */
    endDeclare = async () => {
        // check for objections
        const objections = !this.state.votes.every(vote => vote.agree);
        const even = this.props.index % 2 === 0; // your team
        const body = {
            even: objections ? !even : even,
            key: this.props.roomKey, 
            declare: this.state.guess
        };

        await post("/api/score", body);
    }

    componentDidMount() {
        // pause game and update whose declaring
        socket.on("declaring", (info) => {
            this.setState({
                declaring: true,
                declarer: info.player,
            });
        });

        // update with the declarer's guess
        socket.on("declared", info => {
            this.setState({guess: info.guess});
        });

        // update when someone submits their res to declare
        socket.on("vote", vote => {
            if (vote.name === this.props.name) this.setState({voted: true});
            this.setState({votes: this.state.votes.concat(vote)});
        });

        // update game with results of the declare
        socket.on("updateScore", update => {
            const hand = removeHalfSuit(this.props.hand, update.declare);
            this.props.updateHand(hand);
            this.props.checkIfActive(hand);

            const even = this.props.index % 2 === 0;
            const win = this.props.updateScore(update.even === even);
           
            if (win) {
                this.setState({
                    ongoing: false,
                    winner: even ? "even" : "odd",
                });
            }
            // reset declaring states
            this.setState({
                declaring: false,
                showDeclare: false, 
                declarer: "",
                guess: null,
                lie: false,
                voted: false,
                votes: [],
            });
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
                {this.state.asking &&
                <GuessInput
                    players={this.props.otherTeam.filter(player => player.active)}
                    who={this.state.recipient}
                    rank={this.state.rank}
                    suit={this.state.suit}
                    updateWho={(val) => this.setState({recipient: val})}
                    updateRank={(val) => this.setState({rank: val})}
                    updateSuit={(val) => this.setState({suit: val})}
                    validate={() => false}
                />}
                    {(this.state.recipient && this.state.rank && this.state.suit) &&
                        (<button onClick={this.ask}>Ask</button>)}
                    {this.state.invalid && "You do not have a card in this half suit"}
            </>
        );

        let asker;
        this.props.history.length !== 0 ? asker = this.props.history[this.props.history.length - 1].asker.name : asker = "";
        const respondFunc = (
            <>
                <button onClick={()=>this.setState({responding:true})}>Respond</button>
                <div className={`popup ${(!this.state.declaring && this.state.responding)?"": "hidden"}`}>
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

        const decBtn = (<button onClick={()=>this.setState({showDeclare: true})}>Declare</button>);
        const confirmation = (
            <div className="popup">
                Are you certain? You cannot back out in the middle of a declare.
                This will pause the game.
                <button onClick={this.declaring}>Yes</button>
                <button onClick={()=>this.setState({showDeclare:false})}>No</button>
            </div>
            );

        let declaration;
        if (this.state.declarer) {
            declaration = (
            <div className="popup">
                {this.state.declarer} is declaring!!
            </div>);
        }

        let guess;
        if (this.state.guess) {
            guess = (
                <>
                    {this.state.guess.map(combo => (
                        <div>
                            {combo.player} has the {combo.rank} {combo.suit}
                        </div>
                    ))}
                    {(this.state.declarer !== this.props.name && !this.state.voted) &&
                    (<>
                    Press OBJECT if you see a contradiction. ACCEPT otherwise.
                    <button onClick={()=> this.resToDeclare(true)}>
                        Accept
                    </button>
                    <button onClick={() => this.resToDeclare(false)}>
                        Object
                    </button>
                    {this.state.lie && "Dont lie!!!!"}
                    </>)}
                    {this.state.votes.map(vote => 
                        <div>{vote.name} {vote.agree ? "agees": "OBJECTED"}</div>)}
                </>
            );
        }
        let finish;
        if (this.state.declarer === this.props.name && this.state.votes.length === this.props.yourTeam.length + this.props.otherTeam.length - 1) {
            finish = (<button onClick={this.endDeclare}>Finish</button>);
        }

        return (
            <div>
                Your name: {this.props.name} <br/>
                Player's {this.props.whoseTurn} turn. <br/>
                Turn type: {this.props.turnType}. <br/>
                Your teammates: {
                    this.props.yourTeam.map((player) => 
                    (<><span>{player.name}{player.active? "": "OUT"}</span><br/></>))
                } <br/>
                Opposing team: {
                    this.props.otherTeam.map((player) => 
                    (<span>{player.name}{player.active? "": "OUT"}</span>))
                } <br/>
                <div className="game">
                    { this.state.ongoing ? 
                    (<>{decBtn} 
                        { this.state.showDeclare && confirmation }
                        { this.state.declaring && declaration }
                        { (this.state.declarer === this.props.name && !this.state.guess)&& <Declare yourTeam={this.props.yourTeam} roomKey={this.props.roomKey}/>}
                        { guess }
                        { finish }
                        {
                            this.props.whoseTurn === this.props.name ?
                                this.props.turnType === "ask" ?
                                    askFunc
                                    : respondFunc
                                : ""
                        }
                        </>)
                        : (<span>Game Over! {`Team ${this.state.winner} won!`}</span>) }
                        </div>
                <div className="cards">{cards}</div>
                <Chat name={this.props.name} roomKey={this.props.roomKey}/>
            </div>
        );
    }
}


export default PlayRoom;