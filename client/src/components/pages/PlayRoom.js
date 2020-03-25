import React, { Component } from "react";
import { post } from "../../utilities";
import { removeHalfSuit } from "../../game-utilities";
import { socket } from "../../client-socket";
import Chat from "./Chat.js";
import Ask from "../modules/Ask.js";
import Respond from "../modules/Respond.js";
import Declare from "../modules/Declare.js";
import DecResponse from "../modules/DecResponse.js";
import { card_svgs } from "../card_svgs.js";

import "../styles/game.scss";
import "../styles/App.scss";
import "../styles/cards.scss";
import "../styles/playroom.scss";
import "../styles/base.scss";

const PARITY_TO_TEAM = { "even": "BLUE", "odd": "RED" };

class GameStats extends Component {
    constructor(props){
        super(props);
        this.state = {
        };
    }

    componentDidMount() {
        socket.on("playerOut", info => {
            this.setState({counter: this.state.counter + 1});
        })
    }

    generatePlayer = (parity) => {
        let team;
        if (this.props.parity === parity) team = this.props.yourTeam;
        else team = this.props.otherTeam;

        if (team) {
            return team.map(player => {
                return(
                <div className={`stats_player team-${parity} ${player.active ? "" : "out"}`}>
                    {player.name} {player.active ? "": " (OUT)"}
                </div>
            )});
        }
    }

    render() {

        return (
        <div className="stats">
            <div className="stats_team-name">
                {Object.keys(PARITY_TO_TEAM).map(parity => (
                    <span> 
                        TEAM {PARITY_TO_TEAM[parity]} 
                        {this.props.parity === parity 
                            ? `(YOU): ${this.props.yourTeamScore}`
                            : `: ${this.props.otherTeamScore}`}
                    </span>                
                ))}
            </div>
            <div className="stats_players">
                {Object.keys(PARITY_TO_TEAM).map(parity => this.generatePlayer(parity))}
            </div>
        </div>
        
        )
    }
}

class GameHistory extends Component {
    constructor(props){
        super(props);
        this.state = {

        };
    }

    render() {
        const history = this.props.history.map(move => {
            if (move.type === "ask")
                return (
                    <div className="message history_move">
                        <div className="sender history_move-who">
                            {move.asker.name} asked 
                        </div>
                        <div className="content history_move-what">
                            {move.recipient} do you have the {move.rank} {move.suit}?
                        </div>
                    </div>
                );
            else {
                const result = move.success ? "did" : "did not";
                console.log(move);
                return (
                    <>
                        <div className="message history_move">
                            <div className="sender history_move-who">
                                {move.responder.name} said
                            </div>
                            <div className="content history_move-what">
                                {move.response}
                            </div>
                        </div>
                        <div className="server-message history_move-result">
                            {move.responder.name} {result} have the {move.rank} {move.suit}
                        </div>
                    </>
                );
            }
        })
        console.log(history);
        console.log(this.props.history);
        return (
            <div className="history">
                {this.props.all 
                    ? history
                    : history[history.length - 1]}
            </div>
        );
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
            declarer: "",
            guess: [],
            ongoing: true,
            winner: null,
        };
    }

    /*
     visualize your current hand
     */
    createCards = (hand) => {
        return hand.map(card => (
            <div className={`card card-${this.props.hand.length}`}>
                <img src={card_svgs[`${card.rank}-${card.suit}.svg`]}/>
            </div>
        ));
    };

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
            cards = this.createCards(this.props.hand);
        }
        let asker;
        this.props.history.length !== 0 ? asker = this.props.history[this.props.history.length - 1].asker.name : asker = "";

        const decBtn = (<button className="btn declare-btn" onClick={()=>this.setState({showDeclare: true})}>Declare</button>);

        return (
            <>
                <div className="header">
                { this.state.ongoing ? 
                    (<>{this.state.declarer ? "": decBtn} 
                        { this.state.showDeclare && 
                            <Declare 
                                name={this.props.name}
                                yourTeam={this.props.yourTeam} 
                                roomKey={this.props.roomKey}
                                pause={() => this.setState({declaring: true, declarer: this.props.name})}
                                reset={() => this.setState({showDeclare: false,})}
                            />}
                        {this.state.declarer &&
                            <DecResponse
                                isDeclarer={this.state.declarer === this.props.name}
                                name={this.props.name}
                                guess={this.state.guess}
                                declarer={this.state.declarer}
                                roomKey={this.props.roomKey}
                                hand={this.props.hand}
                                index={this.props.index}
                                minVotes={this.props.yourTeam.length + this.props.otherTeam.length - 1}
                            />}
                        {
                            this.props.whoseTurn === this.props.name && !this.state.declaring ?
                                this.props.turnType === "ask" ?
                                    (<><button
                                        className="btn ask-btn"
                                        onClick={() => this.setState({asking: true})}
                                    >
                                        ASK!!!!
                                    </button>
                                    {!this.state.declaring && this.state.asking && 
                                    <Ask
                                        submitAsk={this.props.submitAsk}
                                        otherTeam={this.props.otherTeam}
                                        hand={this.props.hand}
                                        reset={()=>this.setState({asking:false})}
                                    />}
                                    </>)
                                    : (<><button 
                                            className="btn respond-btn"
                                            onClick={()=>this.setState({responding:true})}
                                        >
                                            Respond
                                        </button>
                                    {!this.state.declaring && this.state.responding && 
                                    <Respond
                                        submitResponse={this.props.submitResponse}
                                        asker={asker}
                                        reset={()=> this.setState({responding: false})}
                                    />}</>)
                                : ""
                        }
                        </>)
                        : (<div className="game-over">Game Over! {`Team ${this.state.winner} won!`}</div>) }
                        <div className={`overlay ${this.state.showDeclare || this.state.asking || this.state.responding ? "" : "hidden"}`}></div>
                </div>
                <div className="container">
                    <Chat name={this.props.name} roomKey={this.props.roomKey}/>
                    <div className="playroom-container">                            
                        {this.props.history &&
                            <GameHistory
                                history={this.props.history}
                                all={false}
                            />
                        }
                        <div className="cards">{cards}</div>
                        <GameStats
                            yourTeam={this.props.yourTeam}
                            otherTeam={this.props.otherTeam}
                            yourTeamScore={this.props.yourTeamScore}
                            otherTeamScore={this.props.otherTeamScore}
                            parity={this.props.index % 2 === 0 ? "even" : "odd"}
                        />
                    </div>
                </div>
            </>
        );
    }
}


export default PlayRoom;