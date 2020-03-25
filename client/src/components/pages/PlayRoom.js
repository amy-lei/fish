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
import "../styles/cards.scss";

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

        const decBtn = (<button onClick={()=>this.setState({showDeclare: true})}>Declare</button>);

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
                            this.props.whoseTurn === this.props.name ?
                                this.props.turnType === "ask" ?
                                    (<><button
                                        className="btn"
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
                                    : (<><button onClick={()=>this.setState({responding:true})}>Respond</button>
                                    {!this.state.declaring && this.state.responding && 
                                    <Respond
                                        submitResponse={this.props.submitResponse}
                                        asker={this.props.asker}
                                        reset={()=> this.setState({responding: false})}
                                    />}</>)
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