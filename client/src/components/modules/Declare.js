import React, { Component } from "react";
import { isValidDeclare } from "../../game-utilities";
import GuessInput from "./GuessInput.js";
import { post } from "../../utilities";

import "../styles/game.scss";
import "../styles/cards.scss";
import "../styles/declare.scss";
const FAKE_DECLARE = [
    {
        player: "A",
        rank: "seven",
        suit: "heart",
    },
    {
        player: "A",
        rank: "two",
        suit: "heart",
    },
    {
        player: "A",
        rank: "three",
        suit: "heart",
    },
    {
        player: "A",
        rank: "four",
        suit: "heart",
    },
    {
        player: "A",
        rank: "five",
        suit: "heart",
    },
    {
        player: "A",
        rank: "six",
        suit: "heart",
    },
]
class Declare extends Component {
    constructor(props){
        super(props);
        this.state = {
            guess: FAKE_DECLARE,
            showInput: false,
            invalid: false,
        };
    }
    /*
        STEP 0 of declaring: 

        Alert other players that you are declaring
        to pause them from asking/responding
     */
    declaring = () => {
        this.setState({
            showInput: true,
            declarer: this.props.name,
        });
        
        this.props.pause();
        const res = post("/api/pause", {key: this.props.roomKey, player: this.props.name});
    }

    // validate the declare before announcing 
    confirm = async () => {
        if (isValidDeclare(this.state.guess)) {
            this.setState({invalid: false,});
            await post("/api/declare", {guess: this.state.guess, key: this.props.roomKey});
            this.props.reset();
        } else {
            this.setState({invalid: true,});
        }
    }

    componentDidMount() {
        let guess = [];
        for (let i = 0; i< 6; i++) {
            guess.push({player: "", rank: "", suit: ""});
        }
        this.setState({guess: FAKE_DECLARE});
    }

    render() {
        let inputs;
        if (this.state.guess) {
            inputs = this.state.guess.map((info, i) => 
            <GuessInput
                key={i}
                players={this.props.yourTeam.filter(player => player.active)}
                who={this.state.guess[i].player}
                rank={this.state.guess[i].rank}
                suit={this.state.guess[i].suit}
                updateWho={(val) => {
                    let cur = this.state.guess;
                    cur[i].player = val;
                    this.setState({guess: cur});
                }}
                updateRank={(val) => {
                    let cur = this.state.guess;
                    cur[i].rank = val;
                    this.setState({guess: cur});
                }}
                updateSuit={(val) => {
                    let cur = this.state.guess;
                    cur[i].suit = val;
                    this.setState({guess: cur});
                }}
                validate={() => true}
                
            />)
        }

        const confirmation = (
            <>
                <div className="declare-confirm">
                    Are you certain? 
                    You cannot back out in the middle of a declare.
                    This will pause the game.
                </div>
                <div className="declare-btns">
                    <button className="btn primary-btn"onClick={this.declaring}>Yes</button>
                    <button className="btn second-btn"onClick={this.props.reset}>No</button>
                </div>
            </>
            );
        console.log('showinp', this.state.showInput);
        return(            
            <div className="popup">
                {!this.state.showInput ? confirmation : <div className="declare-inputs">{inputs}</div>}
                {this.state.showInput && 
                    <button className="btn primary-btn" onClick={this.confirm}>
                        Declare
                    </button>}
                {this.state.invalid && "invalid declare!!!"}
            </div>);

    }
 }
 
 export default Declare;