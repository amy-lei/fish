import React, { Component } from "react";
import Home from "./Home.js";
import Header from "../modules/Header";
import WaitingRoom from "./WaitingRoom.js";
import PlayRoom from "./PlayRoom.js";
import TestDrag from "./TestDrag.js";
import { connect } from 'react-redux';
import { setIndex } from '../../actions/userActions';
import { setRoomKey, updateTurn } from '../../actions/gameActions';

import "../../utilities.css";
import { post } from "../../utilities";
import { hasCard, removeHalfSuit } from "../../game-utilities";
import { socket } from "../../client-socket";

import "../styles/game.scss";
import "../styles/cards.scss";

const WIN = 5; // FIX WHEN LAUNCH!!!
class Game extends Component {
    constructor(props) {
        super(props);
        this.state = {
            page: "home",
            isCreator: false,
            hand: null,
            yourTeam: null,
            otherTeam: null,
            history: [],
            yourTeamScore: 0,
            otherTeamScore: 0,
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
            this.updateGame(info.info.hands[info.self.index], yourTeam, otherTeam);
            this.changePage("play_room");
            this.setState({
                history: info.info.history,
                yourTeamScore: yourScore,
                otherTeamScore: otherScore,
            })
        } else {
            this.setState({
                page: "waiting_room",
                isCreator: false,
                info: info.info,
            });
        }

        this.props.updateTurn(info.info.whoseTurn, info.info.turnType);
        this.props.setIndex(info.self.index);
        
    };
    
    updateGame = (hand, yourTeam, otherTeam) => {
        this.setState({hand, yourTeam, otherTeam});
    };

    updateHand = (hand) => {
        this.setState({hand});
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
        const lastAsk = this.state.history[this.state.history.length - 1]
        const card = { rank: lastAsk.rank, suit: lastAsk.suit };
        const success = hasCard(this.state.hand, card);
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
    updateScore = (yours) => {
        let newScore;
        if (yours) {
            newScore = this.state.yourTeamScore + 1;
            this.setState({yourTeamScore: newScore});
        } else {
            newScore = this.state.otherTeamScore + 1;
            this.setState({otherTeamScore: newScore});
        }
        return newScore === WIN;
    }

    checkIfActive = async(hand) => {
        if (hand.length === 0) {
            const body = {
                key: this.props.key,
                index: this.props.index,
            };
            const g = await post("/api/out", body);
        }
    };

    updateCreator = () => {
        this.setState({isCreator: true});
    }

    componentDidMount() {
        // update history and update turn after an ask
        socket.on("ask", update => {
            console.log('someone was asked,', update);
            this.setState({
                history: update.history,
            });
            this.props.updateTurn(update.move.recipient, 'RESPOND');
        });

        // update turn and hand if successful
        socket.on("respond", update => {
            const turn = update.move.success ? update.move.asker.name: update.move.responder.name;
            if (update.move.success) {
                if (update.move.responder.name === this.state.name) {
                    let hand = this.state.hand.filter(card => 
                        !(card.rank === update.move.rank && card.suit === update.move.suit)); 
                    this.setState({hand});
                    this.checkIfActive(hand);
                } else if (update.move.asker.name === this.state.name) {
                    let hand = this.state.hand.concat({rank:update.move.rank, suit: update.move.suit})
                    this.setState({hand});
                    this.checkIfActive(hand);
                }
            }
            // update history
            this.setState({
                history: update.history,
            });
            this.props.updateTurn(turn, 'ASK');
        });


        socket.on("playerOut", who => {
            const sameTeam = (who.index % 2 === 0) === (this.state.index % 2 === 0);
            if (sameTeam) {
                let updated = this.state.yourTeam;
                for (let player of updated) {
                    if (player.index === who.index) player.active = false;
                }
                this.setState({yourTeam: updated});
            } else {
                let updated = this.state.otherTeam;
                for (let player of updated) {
                    if (player.index === who.index) player.active = false;
                }
                this.setState({otherTeam: updated});
            }
        });

        socket.on("declaring", (info) => {
            this.setState({
                declaring: true,
                declarer: info.player,
                asking: false,
                responding: false,
                showDeclare: this.state.declarer === this.state.name,
            });
        });

        // update game with results of the declare
        socket.on("updateScore", update => {
            const hand = removeHalfSuit(this.state.hand, update.declare);
            this.updateHand(hand);
            this.checkIfActive(hand);

            const even = this.state.index % 2 === 0;
            const win = this.updateScore(update.even === even);
            
            if (win) {
                this.setState({
                    winner: even ? "even" : "odd",
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
        let history = this.state.history.map(move => {
            if (move.type === 'ASK')
                return (
                    <div>
                        {move.asker.name} asked {move.recipient} for {move.rank} {move.suit}
                    </div>
                );
            else {
                const result = move.success ? "did" : "did not";
                return (
                    <>
                        <div>
                            {move.responder.name} responded with {move.response}
                        </div>
                        <div>
                            {move.responder.name} {result} have the {move.rank} {move.suit}
                        </div>
                        <br/>
                    </>
                );
            }
        });
        return (
            <div className={`game-container ${this.state.page === "home" ? "white" : ""}`}>
                <Header
                    gameBegan={this.state.page === "play_room"}
                    gameOver={this.state.winner !== ""}
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
                            updateCreator={this.updateCreator}
                            enterRoom={this.state.isCreator ? this.createRoom : this.enterRoom}
                        />}
                {this.state.page === "waiting_room"
                    &&                 
                    <WaitingRoom
                        isCreator={this.state.isCreator}
                        roomInfo={this.state.info}
                        changePage={this.changePage}
                        updateGame={this.updateGame}
                    />}
                {this.state.page === "play_room"
                    && (
                    <>
                        <PlayRoom
                            hand={this.state.hand}
                            yourTeam={this.state.yourTeam}
                            otherTeam={this.state.otherTeam}
                            submitAsk={this.ask}
                            submitResponse={this.respond}
                            history={this.state.history}
                            updateScore={this.updateScore}
                            updateHand={this.updateHand}
                            checkIfActive={this.checkIfActive}
                            yourTeamScore={this.state.yourTeamScore}
                            otherTeamScore={this.state.otherTeamScore}
                            asking={this.state.asking}
                            responding={this.state.responding}
                            declaring={this.state.declaring}
                            showDeclare={this.state.showDeclare}
                            declarer={this.state.declarer}
                            resetDeclare={() => this.setState({showDeclare: false,})}
                            resetAsk={() => this.setState({asking: false,})}
                            resetRespond={() => this.setState({responding: false,})}
                            pause={() => this.setState({declaring: true, declarer: this.state.name})}        
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
});

const mapDispatchToProps = {
    setIndex,
    setRoomKey,
    updateTurn,
};

export default connect(mapStateToProps, mapDispatchToProps)(Game);