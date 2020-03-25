import React, { Component } from "react";
import { SUITS, RANKS, JOKER_SUITS } from "../../game-utilities.js";

class GuessInput extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }
    
    render() {
        return (
            <div className={`guess-input ${this.props.column ? "guess-input-stack" : ""}`}>
                <div className="guess-input_q">
                    
                    <div className="guess-input_label">Who</div>
                    <select
                        className="guess-input_field" 
                        value={this.props.who} 
                        onChange={(e) => this.props.updateWho(e.target.value)}
                        >
                        <option value=""></option>
                        {this.props.players.map((player, k) => (
                            <option key={k} value={player.name}>{player.name}</option>    
                            ))}
                    </select>
                </div>

                <div className="guess-input_q">
                    <div className="guess-input_label">Rank</div>
                    <select 
                        className="guess-input_field"
                        value={this.props.rank} 
                        onChange={(e) => this.props.updateRank(e.target.value)}
                        >
                        <option value=""></option>
                        {RANKS.map((rank, k) => (
                            <option key={k} value={rank}>{rank}</option>
                            ))}
                    </select>
                </div>
                <div className="guess-input_q">
                    {(this.props.validate() || this.props.rank) && (
                        <>
                            <div className="guess-input_label">Suit</div>
                            <select
                                className="guess-input_field"
                                value={this.props .suit}
                                onChange={(e) => this.props.updateSuit(e.target.value)}
                                >
                                <option value=""></option>
                                { this.state.rank === "joker" ?
                                    JOKER_SUITS.map((suit, k) => (
                                        <option key={k} value={suit}>{suit}</option>
                                        ))
                                        : SUITS.map((suit, k) => (
                                            <option key={k} value={suit}>{suit}</option>
                                        ))
                                }
                            </select>
                        </>
                    )}
                </div>
            </div>
        )
    }
}

export default GuessInput;