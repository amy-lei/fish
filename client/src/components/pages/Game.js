import React, { Component } from "react";
import Home from "./Home.js";
import NameForm from "./NameForm.js";
import WaitingRoom from "./WaitingRoom.js";
import PlayRoom from "./PlayRoom.js";
import TestDrag from "./TestDrag.js";

import "../../utilities.css";
import { post } from "../../utilities";
import { hasCard, isValidAsk, isValidDeclare, canObject, removeHalfSuit } from "../../game-utilities";
import { socket } from "../../client-socket";
import { card_svgs } from "../card_svgs.js";

import "../styles/game.scss";
import "../styles/cards.scss";

const WIN = 5; // FIX WHEN LAUNCH!!!
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
            yourTeamScore: 0,
            otherTeamScore: 0,
        };
    };

    changePage = (page) => {
        this.setState({page});
    };

    updateKey = (key) => {
        this.setState({key})
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
        const trimmedName = name.trim();
        if (trimmedName === "") {
          return;
        }
        const body = {
            playerName: name,
            room_key: this.state.key,
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
                name:info.self.name,
                index: info.self.index,
                turnType: info.info.turnType,
                history: info.info.history,
                whoseTurn: info.info.whoseTurn,
                yourTeamScore: yourScore,
                otherTeamScore: otherScore,
            })
        } else {
            this.setState({
                page: "waiting_room",
                name: info.self.name,
                isCreator: false,
                index: info.self.index,
                info: info.info,
                whoseTurn: info.info.whoseTurn,
                turnType: info.info.turnType,
            });
        }
        
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
            key: this.state.key,
            asker: { name: this.state.name, index: this.state.index},
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
            key: this.state.key,
            responder: {name: this.state.name, index: this.state.index},
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
                key: this.state.key,
                index: this.state.index,
            };
            const g = await post("/api/out", body);
        }
    };

    componentDidMount() {
        // update history and update turn after an ask
        socket.on("ask", update => {
            this.setState({
                history: update.history,
                whoseTurn: update.move.recipient,
                turnType: "respond",
            });
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
                whoseTurn: turn,
                turnType: "ask",
            });
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
    }

    render() {
        let history = this.state.history.map(move => {
            if (move.type === "ask")
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
            <div className="game-container">
                {this.state.page === "test"
                    && <TestDrag />}
                {this.state.page === "home" 
                    && <Home changePage={this.changePage} enterKey={this.updateKey}/>}
                {this.state.page === "create_room"
                    && <NameForm submitName={this.createRoom}/>}
                {this.state.page === "join_room"
                    && <NameForm submitName={this.enterRoom}/>}
                {this.state.page === "waiting_room"
                    &&                 
                    <WaitingRoom
                        roomKey={this.state.key}
                        name={this.state.name}
                        index={this.state.index}
                        isCreator={this.state.isCreator}
                        roomInfo={this.state.info}
                        changePage={this.changePage}
                        updateGame={this.updateGame}
                    />}
                {this.state.page === "play_room"
                    && (
                    <>
                        <PlayRoom
                            roomKey={this.state.key}
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
                            updateScore={this.updateScore}
                            updateHand={this.updateHand}
                            checkIfActive={this.checkIfActive}
                            yourTeamScore={this.state.yourTeamScore}
                            otherTeamScore={this.state.otherTeamScore}
                        />
                    </>)}
            </div>
        );
    };
}

export default Game;