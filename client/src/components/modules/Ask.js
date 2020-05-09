import React, { Component } from "react";
import { isValidAsk } from "../../game-utilities";
import GuessInput from "./GuessInput.js";


import "../styles/game.scss";
import "../styles/cards.scss";

class Ask extends Component {
    constructor(props){
        super(props);
        this.state = {
            invalid: false,
            recipient: "",
            rank: "",
            suit: "",
        };
    }

    /*  
        Validate ask before posting,
        and reset states related to ask
    */
    ask = () => {
        if (isValidAsk(this.props.hand, {rank: this.state.rank, suit: this.state.suit})) {
            this.props.submitAsk(this.state.recipient, this.state.rank, this.state.suit)
            this.setState({
                invalid: false,
                asking: false,
                recipient: "",
                rank: "",
                suit: "",
            });
            console.log('submitting ask')
            this.props.reset();
        } else this.setState({invalid: true});
    }

    render() {
        return (
            <div className="popup">
                <button
                    className="close-btn"
                    onClick={this.props.reset}
                >
                    X
                </button>
                <GuessInput
                    players={this.props.otherTeam.filter(player => player.active)}
                    who={this.state.recipient}
                    rank={this.state.rank}
                    suit={this.state.suit}
                    updateWho={(val) => this.setState({recipient: val})}
                    updateRank={(val) => this.setState({rank: val})}
                    updateSuit={(val) => this.setState({suit: val})}
                    validate={() => true}
                    column={true}
                    reset={this.props.reset}
                />
                {this.state.recipient && this.state.rank && this.state.suit &&
                    (<button 
                        className="btn primary-btn"
                        onClick={this.ask}
                        >Ask</button>)}

                {this.state.invalid && 
                    <span className="warning">Invalid Ask</span>
                }
            </div>

        );
    }
}

export default Ask;