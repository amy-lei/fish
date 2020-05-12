import React, { Component } from "react";
import { isValidAsk } from "../../game-utilities";
import { connect } from 'react-redux';
import { post } from "../../utilities";
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
    ask = async() => {
        const { recipient, rank, suit } = this.state;
        const { hand, roomkey, name, index } = this.props;
        
        if (isValidAsk(hand, {rank, suit})) {
            const body = {
                key: roomkey,
                asker: { name, index },
                recipient, 
                rank,
                suit,
            };
            const res = await post('/api/ask', body);
            this.setState({
                invalid: false,
                recipient: "",
                rank: "",
                suit: "",
            });
            this.props.reset();
        } else this.setState({ invalid: true });
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

const mapStateToProps = (state) => ({
    name: state.user.name,
    index: state.user.index,
    roomkey: state.roomkey,
    hand: state.hand,
    otherTeam: state.teams.otherTeam,
});

export default connect(mapStateToProps, {})(Ask);