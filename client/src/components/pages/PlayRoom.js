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
import GlobalContext from '../../context/GlobalContext';
import { Redirect } from 'react-router';

class PlayRoom extends Component {
    
    static contextType = GlobalContext;

    constructor(props) {
        super(props);
        this.state = {
            view: 'hand',
            sidebar: "chat",
            declaring: false,
            guess: {},
            declarer: '',
            halfSuit: '',
        };
    }

    adjustTurn = (player) => {
        const {
            turnType,
            yourTeam,
            otherTeam,
            history,
        } = this.props;
        
        // find the team the player is in
        const mapIndexToPlayer = {};
        [otherTeam, yourTeam].forEach((team) => 
            team.forEach((player) => {
                mapIndexToPlayer[player.index] = player;
            }));

        // if it was an ask, move it to next teammate
        if (turnType === 'ASK') {
            let nextIndex = (player.index + 2) % 6;
            while (nextIndex !== player.index) {
                const nextPlayer = mapIndexToPlayer[nextIndex]
                if (nextPlayer && nextPlayer.active) {
                    this.props.updateTurn(nextPlayer.name, 'ASK');
                    return;
                } else {
                    nextIndex = (nextIndex + 2) % 6;
                }
            }
            return; // force other team to declare
        } else {
            // if it was respond, have prev asker ask again
            const prevTurn = history[history.length - 1];
            let askerIndex = prevTurn.asker.index;
            let nextPlayer = mapIndexToPlayer[askerIndex];
            if (nextPlayer && nextPlayer.active) {
                this.props.updateTurn(nextPlayer.name, 'ASK');
                return;
            } else {
                nextIndex = (nextIndex + 2) % 6;
                while (nextIndex !== askerIndex) {
                    nextPlayer = mapIndexToPlayer[nextIndex]
                    if (nextPlayer && nextPlayer.active) {
                        this.props.updateTurn(nextPlayer.name, 'ASK');
                        return;
                    } else {
                        nextIndex = (nextIndex + 2) % 6;
                    }
                }
                return;
            }
        }
    }

    componentDidMount() {
        // pause game for non declarers
        socket.on("declaring", (info) => {
            this.setState({
                declaring: true,
                declarer: info.player,
            }, () => {
                if (this.context.name !== info.player) {
                    this.setState({ view: 'vote'});
                }
            })
        });
        
        // update with the declarer's guess
        socket.on("declared", info => {
            this.setState({guess: info.guess, halfSuit: info.halfSuit});
        });

        // update game with results of the declare
        socket.on("updateScore", update => {
            // reset declaring states
            this.setState({
                view: 'hand',
                declaring: false,
                guess: {},
                declarer: '',
                halfSuit: '',
            });
        });
    }

    changeSidebar = (type) => {
        this.setState({ sidebar: type })
    };

    changeView = (view) => {
        this.setState({ view });
    }

    render() {
        const {
            name, 
            index,
            hand,
            roomkey,
            turnType,
            whoseTurn,
            yourTeam,
            otherTeam,
            winner,
        } = this.context;

        // prevent users from skipping waiting room/homepage
        if (!name || !roomkey || !hand) {
            return <Redirect to='/'/>;
        }

        const { 
            declaring,
            declarer,
            view,
            guess,
            halfSuit,
            sidebar,
        } = this.state;
        
        let curView;
        const gameOver = winner !== '';
        if (gameOver || view === 'hand') {
            curView = <ViewHand />
        } else if (view === 'ask') {
            curView = <Ask reset={this.changeView}/>
        } else if (view === 'respond') {
            curView = <Respond reset={this.changeView}/>
        } else if (view === 'declare') {
            curView = <Declare changeView={this.changeView}/>
        } else if (view === 'vote') {
            curView = <DecResponse 
                declarer={declarer}
                guess={guess}
                halfSuit={halfSuit}
                minVotes={yourTeam.length + otherTeam.length - 1}
            />
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
                        changeView={this.changeView}
                    />
                    {curView}
                    <div className="sidebar">
                        <div className="sidebar-label">
                            <span
                                className={`sidebar-label_options ${sidebar === "chat" ? "active-sidebar" : "inactive-sidebar"}`}
                                onClick={() => this.changeSidebar("chat")}
                            >
                                Chat Room
                            </span>
                            <span className={"divider"}>|</span>
                            <span
                                className={`sidebar-label_options ${sidebar === "ask" ? "active-sidebar" : "inactive-sidebar"}`}
                                onClick={() => this.changeSidebar("ask")}
                            >
                                Ask History
                            </span>
                        </div>
                        <Chat
                            name={name}
                            index={index}
                            roomkey={roomkey}
                            hidden={sidebar !== "chat"}
                        />
                        <GameHistory
                            all={true}
                            hidden={sidebar === "chat"}
                        />
                    </div>
                </div>
            </>
        );
    }
}

export default PlayRoom;