import React, { Component } from "react";
import Home from "./Home.js";
import Header from "../modules/Header";
import WaitingRoom from "./WaitingRoom.js";
import PlayRoom from "./PlayRoom.js";
import TestDrag from "./TestDrag.js";
import { connect } from 'react-redux';
import { submitName, setIndex } from '../../actions/userActions';
import { 
    setRoomKey, 
    updateTurn,
    addCard,
    removeCard,
    removeSuit,
    playerOut,
    setTeams,
    declareResults,
    updateHistory,
 } from '../../actions/gameActions';

import "../../utilities.css";
import { post } from "../../utilities";
import { hasCard } from "../../game-utilities";
import { socket } from "../../client-socket";

import "../styles/game.scss";
import "../styles/cards.scss";

const WIN = 1; // FIX WHEN LAUNCH!!!
class Game extends Component {
    constructor(props) {
        super(props);
        this.state = {
            page: "home",
            isCreator: false,
            asking: false,
            responding: false,
            declaring: false,
            showDeclare: false, 
            declarer: "",
            winner: "",
        };
    };

    changePage = (page) => {
        this.setState({page});
    };

    createRoom = async (name) => {
        const trimmedName = name.trim();
        if (trimmedName === "") {
          return;
        }
        const body = {
            creatorName: name,
            socketid: socket.id,
        };
        const game = await post('/api/create_room', body);
        
        this.props.setIndex(0);
        this.props.submitName(name);
        this.props.setRoomKey(game.key);
        this.props.updateTurn(this.props.name, 'ASK');

        this.setState({
            page: "waiting_room",
            isCreator: true,
        });
    };

    enterRoom = async (name) => {
        const trimmedName = name.trim();
        if (trimmedName === "") {
          return;
        }
        const body = {
            playerName: name,
            room_key: this.props.roomkey,
            socketid: socket.id,
        };
        const info = await post('/api/join_room', body);
        if (info.return) {
            let otherTeam = [];
            let yourTeam = [];
            let yourScore;
            let otherScore;
            const parity = info.self.index % 2;
            info.info.players.forEach((player) => {
                if (player.index % 2 === parity) yourTeam.push(player);
                else otherTeam.push(player);
            });
            if (parity) {
                yourScore = info.info.even;
                otherScore = info.info.odd;
            } else {
                yourScore = info.info.odd;
                otherScore = info.info.even;
            }
            this.props.setTeams(yourTeam, otherTeam);
            this.props.updateScore(yourScore, otherScore);
            this.changePage("play_room");
            this.props.updateHistory(info.info.history);
        } else {
            this.setState({
                page: "waiting_room",
                isCreator: false,
                info: info.info,
            });
        }

        this.props.updateTurn(info.info.whoseTurn, info.info.turnType);
        this.props.setIndex(info.self.index);
        this.props.submitName(info.self.name);
        
    };
    
    // Send ask with info pertaining to who and what
    ask = async (who, rank, suit) => {
        const body = {
            key: this.props.roomkey,
            asker: { name: this.props.name, index: this.props.index},
            recipient: who, 
            rank: rank,
            suit: suit,
        };
        const res = await post('/api/ask', body);
    };

    // Send response with info about who, what, and success
    respond = async (response) => {
        const lastAsk = this.props.history[this.props.history.length - 1]
        const card = { rank: lastAsk.rank, suit: lastAsk.suit };
        const success = hasCard(this.props.hand, card);
        const body = {
            key: this.props.roomkey,
            responder: {name: this.props.name, index: this.props.index},
            asker: lastAsk.asker,
            response: response,
            success: success,
            card: card,
        };
        await post("/api/respond", body);
    };

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

        socket.on("declaring", (info) => {
            this.setState({
                declaring: true,
                declarer: info.player,
                asking: false,
                responding: false,
                showDeclare: this.state.declarer === this.props.name,
            });
        });

        // update game with results of the declare
        socket.on("updateScore", update => {
            this.props.removeSuit(
                this.props.roomkey,
                this.props.index,
                update.declare,
            );
            console.log('score update', update);
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
                declarer: "",
            });
        });

    }

    render() {
        return (
            <div className={`game-container ${this.state.page === "home" ? "white" : ""}`}>
                <Header
                    gameBegan={this.state.page === "play_room"}
                    winner={this.state.winner}
                    showAsk={!this.state.declaring 
                            && this.props.turnType === 'ASK'    
                            && this.props.whoseTurn === this.props.name
                            }
                    showRespond={!this.state.declaring 
                            && this.props.turnType === 'RESPOND'    
                            && this.props.whoseTurn === this.props.name
                            }
                    showDeclare={this.state.declarer === ""}
                    onClickDeclare={() => this.setState({showDeclare: true})}
                    onClickAsk={() => this.setState({asking: true})}
                    onClickRespond={() => this.setState({responding: true})}
                />
                {this.state.page === "test"
                    && <TestDrag />}
                {this.state.page === "home" 
                    && <Home 
                            changePage={this.changePage} 
                            updateCreator={() => this.setState({ isCreator: true })}
                            enterRoom={this.state.isCreator ? this.createRoom : this.enterRoom}
                        />}
                {this.state.page === "waiting_room"
                    &&                 
                    <WaitingRoom
                        isCreator={this.state.isCreator}
                        roomInfo={this.state.info}
                        changePage={this.changePage}
                    />}
                {this.state.page === "play_room"
                    && (
                    <>
                        <PlayRoom
                            submitAsk={this.ask}
                            submitResponse={this.respond}
                            asking={this.state.asking}
                            responding={this.state.responding}
                            declaring={this.state.declaring}
                            showDeclare={this.state.showDeclare}
                            declarer={this.state.declarer}
                            resetDeclare={() => this.setState({showDeclare: false,})}
                            resetAsk={() => this.setState({asking: false,})}
                            resetRespond={() => this.setState({responding: false,})}
                            pause={() => this.setState({declaring: true, declarer: this.props.name})}        
                            gameOver={this.state.winner !== ""}
                        />
                    </>)}
            </div>
        );
    };
}

const mapStateToProps = (state) => ({
    name: state.user.name,
    index: state.user.index,
    roomkey: state.roomkey,
    turnType: state.turnInfo.turnType,
    whoseTurn: state.turnInfo.whoseTurn,
    hand: state.hand,
    scores: state.scores,
    history: state.history,
});

const mapDispatchToProps = {
    submitName,
    setIndex,
    setRoomKey,
    updateTurn,
    addCard,
    removeCard,
    removeSuit,
    playerOut,
    setTeams,
    declareResults,
    updateHistory,
};

export default connect(mapStateToProps, mapDispatchToProps)(Game);