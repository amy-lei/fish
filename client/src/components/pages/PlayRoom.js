import React, { Component } from "react";
import { socket } from "../../client-socket";
import Chat from "./Chat.js";
import Ask from "../modules/Ask.js";
import Respond from "../modules/Respond.js";
import Declare from "../modules/Declare.js";
import DecResponse from "../modules/DecResponse.js";
import { card_svgs } from "../card_svgs.js";
import { connect } from 'react-redux';

import "../styles/Chat.scss";
import "../styles/game.scss";
import "../styles/App.scss";
import "../styles/cards.scss";
import "../styles/playroom.scss";
import "../styles/base.scss";


const PARITY_TO_TEAM = { "even": "BLUE", "odd": "RED" };
const FACES = [':)', '•_•', '=U','°_o',':O','°Д°'];

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
            if (move.type === 'ASK')
                return (
                    <div className={`message history_move ${this.props.all?"left":""}`}>
                        <div className={`message_img ${
                            move.asker.index % 2 == 0? 'team-even' : 'team-odd'}`}>
                            {FACES[move.asker.index]} 
                        </div>
                        <div className="message_info">
                            <div className={`message_info-sender history_move-who ${this.props.all ? "more-space": ""}`}>
                                {move.asker.name} asked 
                            </div>
                            <div className="message_info-content history_move-what">
                                {move.recipient} do you have the {move.rank} {move.suit}?
                            </div>
                        </div>
                    </div>
                );
            else {
                const result = move.success ? "did" : "did not";
                return (
                    <>
                        <div className={`message history_move ${this.props.all?"left":""}`}>
                            <div className={`message_img ${
                                move.responder.index % 2 == 0? 'team-even' : 'team-odd'}`}>
                                {FACES[move.responder.index]} 
                            </div>
                            <div className="message_info">
                                <div className={`message_info-sender history_move-who ${this.props.all ? "more-space": ""}`}>
                                    {move.responder.name} said
                                </div>
                                <div className="message_info-content history_move-what">
                                    {move.response}
                                </div>
                            </div>
                        </div>
                        <div className="server-message history_move-result">
                            {move.responder.name} {result} have the {move.rank} {move.suit}
                        </div>
                    </>
                );
            }
        });
        return (
            <div className={`messages history ${this.props.hidden ? "hidden" : ""}`} hidden={this.props.hidden}>
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
            guess: [],
            ongoing: true,
            winner: null,
            sidebar: "chat",
        };
    }

    /*
     visualize your current hand
     */
    createCards = (hand) => {
        return hand.map(card => (
            <div className={`card card-${hand.length}`}>
                <img src={card_svgs[`${card.rank}-${card.suit}.svg`]}/>
            </div>
        ));
    };

    componentDidMount() {
        // update with the declarer's guess
        socket.on("declared", info => {
            this.setState({guess: info.guess});
        });

        // update game with results of the declare
        socket.on("updateScore", update => {
            // reset declaring states
            this.setState({
                guess: [],
                lie: false,
                voted: false,
                votes: [],
            });
        });
    }

    changeSidebar = (type) => {
        this.setState({sidebar: type})
    };

    render() {
        const { hand } = this.props;

        let cards = "Loading cards";
        if (hand) {
            cards = this.createCards(hand);
        }
        let asker;
        this.props.history.length !== 0 ? asker = this.props.history[this.props.history.length - 1].asker.name : asker = "";

        return (
            <>
                { !this.props.gameOver && this.props.showDeclare && 
                    <Declare 
                        name={this.props.name}
                        yourTeam={this.props.yourTeam} 
                        roomkey={this.props.roomkey}
                        pause={this.props.pause}
                        reset={this.props.resetDeclare}
                    />}
                {!this.props.gameOver && this.props.declarer &&
                    <DecResponse
                        isDeclarer={this.props.declarer === this.props.name}
                        name={this.props.name}
                        guess={this.state.guess}
                        declarer={this.props.declarer}
                        roomkey={this.props.roomkey}
                        index={this.props.index}
                        minVotes={this.props.yourTeam.length + this.props.otherTeam.length - 1}
                    />}
                {!this.props.gameOver && !this.props.declaring && this.props.asking && 
                    <Ask
                        submitAsk={this.props.submitAsk}
                        reset={this.props.resetAsk}
                    />}
                {!this.props.gameOver && !this.props.declaring && this.props.responding && 
                    <Respond
                        submitResponse={this.props.submitResponse}
                        asker={asker}
                        reset={this.props.resetRespond}
                    />}
                <div className={`overlay ${this.props.showDeclare || this.props.asking || this.props.responding ? "" : "hidden"}`}></div>
                <div className="container">
                    <div className="sidebar">
                        <div className="sidebar-label">
                            <span
                                className={`sidebar-label_options ${this.state.sidebar === "chat" ? "active-sidebar" : "inactive-sidebar"}`}
                                onClick={() => this.changeSidebar("chat")}
                            >
                                Chat Room
                            </span>
                            <span className={"divider"}>|</span>
                            <span
                                className={`sidebar-label_options ${this.state.sidebar === "ask" ? "active-sidebar" : "inactive-sidebar"}`}
                                onClick={() => this.changeSidebar("ask")}
                            >
                                Ask History
                            </span>
                        </div>

                        <Chat
                            name={this.props.name}
                            index={this.props.index}
                            roomkey={this.props.roomkey}
                            hidden={this.state.sidebar !== "chat"}
                        />
                        <GameHistory
                            history={this.props.history}
                            all={true}
                            hidden={this.state.sidebar === "chat"}
                        />
                    </div>
                    <div className="main-container playroom">                            
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
                            yourTeamScore={this.props.scores.yourTeam}
                            otherTeamScore={this.props.scores.otherTeam}
                            parity={this.props.index % 2 === 0 ? "even" : "odd"}
                        />
                    </div>
                </div>
            </>
        );
    }
}

const mapStateToProps = (state) => ({
    name: state.user.name,
    index: state.user.index,
    roomkey: state.roomkey,
    hand: state.hand,
    yourTeam: state.teams.yourTeam,
    otherTeam: state.teams.otherTeam,
    scores: state.scores,
});

export default connect(mapStateToProps, {})(PlayRoom);