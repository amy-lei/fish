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

import { post } from "../../utilities";
import { hasCard } from "../../game-utilities";
import { socket } from "../../client-socket";

const WIN = 5; // FIX WHEN LAUNCH!!!
class Game extends Component {
    constructor(props) {
        super(props);
        this.state = {
            asking: false,
            responding: false,
            declaring: false,
            showDeclare: false, 
            declarer: "",
            winner: "",
        };
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
                            declarer={this.state.declarer}
                            resetDeclare={() => this.setState({showDeclare: false,})}
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