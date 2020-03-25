import React, { Component } from "react";
const SUITS = [
    'heart', 
    'diamond', 
    'spade', 
    'club',
  ];
const JOKER_SUITS = [
    'red',
    'black',
];
const RANKS = [
    'ace',
    'two',
    'three',
    'four',
    'five',
    'six',
    'seven',
    'eight',
    'nine',
    'ten',
    'jack',
    'queen',
    'king',
    'joker',
];

class GuessInput extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }
    
    render() {
        return (
            <div className={`guess-input`}>
                Who
                <select 
                    value={this.props.who} 
                    onChange={(e) => this.props.updateWho(e.target.value)}
                    >
                    <option value=""></option>
                    {this.props.players.map((player, k) => (
                        <option key={k} value={player.name}>{player.name}</option>    
                        ))}
                </select>

                Rank
                <select 
                    value={this.props.rank} 
                    onChange={(e) => this.props.updateRank(e.target.value)}
                    >
                    <option value=""></option>
                    {RANKS.map((rank, k) => (
                        <option key={k} value={rank}>{rank}</option>
                        ))}
                </select>

                {(this.props.validate() || this.props.rank) && (
                    <>
                        Suit
                        <select
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
        )
    }
}

export default GuessInput;