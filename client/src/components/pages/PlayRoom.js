import React, { Component } from "react";
import { socket } from "../../client-socket";
import Chat from "./Chat.js";
import Ask from "../modules/Ask.js";
import Respond from "../modules/Respond.js";
import Declare from "../modules/Declare.js";
import DecResponse from "../modules/DecResponse.js";
import GameHistory from '../modules/GameHistory';
import ViewHand from '../modules/ViewHand';
import Header from '../modules/Header';
import { connect } from 'react-redux';
import { Redirect } from 'react-router';
import {
    declareResults,
    updateTurn,
    addCard,
    removeCard,
    removeSuit,
    playerOut,
    updateHistory,
} from '../../actions/gameActions';

const WIN = 5; // FIX WHEN LAUNCH!!!

class PlayRoom extends Component {
    constructor(props) {
        super(props);
        this.state = {
            view: 'hand',
            guess: [],
            sidebar: "chat",
            declaring: false,
            declarer: '',
            winner: '',
        };
    }

    // Update your score if true, others if false
    updateScore = (even, evenScore, oddScore) => {
        if (even) {
            this.props.declareResults(evenScore, oddScore);
        } else {
            this.props.declareResults(oddScore, evenScore);
        }
        return evenScore === WIN || oddScore === WIN;
    }

    componentDidMount() {
        // update history and update turn after an ask
        socket.on("ask", update => {
            this.props.updateHistory(update.history);
            this.props.updateTurn(update.move.recipient, 'RESPOND');
        });

        // update turn and hand if successful
        socket.on("respond", update => {
            const turn = update.move.success ? update.move.asker.name: update.move.responder.name;
            if (update.move.success) {
                if (update.move.responder.name === this.props.name) {
                    this.props.removeCard(
                        this.props.roomkey,
                        this.props.index,
                        update.move.rank,
                        update.move.suit,
                    );
                } else if (update.move.asker.name === this.props.name) {
                    this.props.addCard(
                        update.move.rank,
                        update.move.suit,
                    )
                }
            }
            // update history
            this.props.updateHistory(update.history);
            this.props.updateTurn(turn, 'ASK');
        });

        socket.on("playerOut", who => {
            this.props.playerOut(who.index);
        });
        
        // update with the declarer's guess
        socket.on("declared", info => {
            this.setState({guess: info.guess});
        });

        socket.on("declaring", (info) => {
            this.setState({
                declaring: true,
                declarer: info.player,
                asking: false,
                responding: false,
                showDeclare: info.player === this.props.name,
            });
        });

        // update game with results of the declare
        socket.on("updateScore", update => {
            this.props.removeSuit(
                this.props.roomkey,
                this.props.index,
                update.declare,
            );
            const even = this.props.index % 2 === 0;
            const gameOver = this.updateScore(even, update.evenScore, update.oddScore);
            
            if (gameOver) {
                this.setState({
                    winner: update.even ? "even" : "odd",
                });
            }
            // reset declaring states
            this.setState({
                declaring: false,
                showDeclare: false,
                declarer: '',
            });
        });
    }

    changeSidebar = (type) => {
        this.setState({sidebar: type})
    };

    render() {
        // prevent users from skipping waiting room/homepage
        if (!this.props.name || !this.props.roomkey || !this.props.otherTeam) {
            return <Redirect to='/'/>;
        }

        const { 
            hand,
            turnType,
            whoseTurn,
            name,
        } = this.props;
        const { 
            declaring,
            declarer,
            winner,
            view,
        } = this.state;
        
        let curView;
        const gameOver = winner !== '';
        if (gameOver || view === 'hand') {
            curView = <ViewHand hand={hand}/>
        } else if (view === 'ask') {
            curView = <Ask reset={(view) => this.setState({view})}/>
        } else if (view === 'respond') {
            curView = <Respond reset={(view) => this.setState({view})}/>
        } else if (view === 'declare') {
            curView = <Declare />
        }

        return (
            <>
                <div className="container">
                    <Header
                        winner={winner}
                        view={view}
                        gameBegan={true}
                        showAsk={!declaring 
                            && turnType === 'ASK'
                            && whoseTurn === name}
                        showRespond={!declaring
                            && turnType === 'RESPOND'
                            && whoseTurn === name}
                        showDeclare={declarer === ''}
                        changeView={(view) => this.setState({view})}
                    />
                    {curView}
                    {!gameOver && declaring && declarer &&
                        <DecResponse
                            isDeclarer={this.state.declarer === this.props.name}
                            name={this.props.name}
                            guess={this.state.guess}
                            declarer={this.state.declarer}
                            roomkey={this.props.roomkey}
                            index={this.props.index}
                            minVotes={this.props.yourTeam.length + this.props.otherTeam.length - 1}
                        />}
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
                            all={true}
                            hidden={this.state.sidebar === "chat"}
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
    history: state.history,
    turnType: state.turnInfo.turnType,
    whoseTurn: state.turnInfo.whoseTurn,
});

const mapDispatchToProps = {
    declareResults,
    updateTurn,
    addCard,
    removeCard,
    removeSuit,
    playerOut,
    updateHistory,
};

export default connect(mapStateToProps, mapDispatchToProps)(PlayRoom);