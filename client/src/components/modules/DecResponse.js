import React, { Component } from "react";
import { post } from "../../utilities";
import { canObject } from "../../game-utilities";
import { socket } from "../../client-socket";
import { connect } from 'react-redux';
import { card_svgs } from '../card_svgs';
import "../styles/declare.scss";


class DecResponse extends Component {
    constructor(props){
        super(props);
        this.state = {
            lie: false,
            votes: [],
            voted: false,
        };
    }
    /*
        STEP 1 of declaring: 

        Submit your response to the declare
        and alert others. 
        If OBJECT, validate the objection first
     */
    resToDeclare = async (bool) => {
        const {
            hand,
            guess,
            name,
            roomkey,
        } = this.props;

        const body = {
            key: roomkey,
            player: name, 
            agree: bool,
        };
        if (bool) await post("/api/vote", body);
        else {
            // validate objections first
            if (canObject(hand, guess, name)){
                console.log('object!');
                await post("/api/vote", body);
                this.setState({lie: false});
            } 
            else this.setState({lie:true}); 
        }
    }
    /*
        STEP 2 of declaring:

        Once everyone has voted, check for any objections
        (which results in other team gaining the point). 
        Announce results.

     */
    endDeclare = async () => {
        // check for objections
        const objections = !this.state.votes.every(vote => vote.agree);
        const even = this.props.index % 2 === 0; // your team
        const body = {
            even: objections ? !even : even,
            key: this.props.roomkey, 
            halfSuit: this.props.halfSuit,
        };
        // reset declaring states
        this.setState({
            lie: false,
            voted: false,
            votes: [],
        });
        await post("/api/score", body);
    }

    componentDidMount() {
        // update when someone submits their res to declare
        socket.on("vote", vote => {
            if (vote.name === this.props.name) this.setState({voted: true});
            this.setState({votes: this.state.votes.concat(vote)});
        });
    }
    createHand = (hand) => {
        return hand.map((card,i) => (
            <img 
                key={i}
                className={`mini-card ${this.state.selectedCard === card && 'selected-card'}`} 
                src={card_svgs[`${card.rank}-${card.suit}.svg`]}
                onClick={() => this.setState({selectedCard: card})}    
            />
        ));
    };

    createGuesses = (guess) => {
        return Object.keys(guess).map((player, i) => 
            <div key={i} className='vote-guess declare-column'>
                <p>{player}</p>
                <div className='declare-input_player'>
                    {guess[player].map((card, k) => 
                        <img
                            key={k}
                            className='mini-card'
                            src={card_svgs[`${card.rank}-${card.suit}.svg`]}
                        />)}
                </div>
            </div>
        );
    }

    render() {
        const {
            declarer,
            guess,
            name,
            hand,
            minVotes,
        } = this.props;

        let filler;
        let guesses;
        let voteButtons;
        let votes;
        if (Object.keys(guess).length === 0) {
            filler = <label className='vote-filler'>
                {declarer} is guessing
            </label>
        } else {
            guesses = <>
                <label>Declaration:</label>
                <div className='vote-guesses declare-input_players'>
                    {this.createGuesses(guess)}
                </div>
            </>
            
            votes = <>
                <label>Votes:</label>
                <div className='vote-responses'>
                    {this.state.votes.map((vote) => 
                        <div className='vote-response'>
                            {vote.name} {vote.agree ? 'agrees' : 'OBJECTED'}
                        </div>
                    )}
                </div>
            </>;

            if (declarer !== name) {
                voteButtons = <div className='vote-btns'>
                    <button
                        className={`primary-btn short-btn vote-btn ${this.state.voted && 'disabled-btn'}`}
                        disabled={this.state.voted}
                        onClick={() => this.resToDeclare(true)}
                    >
                        Agree
                    </button>
                    <button
                        className={`primary-btn short-btn vote-btn ${this.state.voted && 'disabled-btn'}`}
                        disabled={this.state.voted}
                        onClick={() => this.resToDeclare(false)}
                    >
                        Object
                    </button>
                </div>
            } else {
                voteButtons = <button
                    className={`primary-btn long-btn ${this.state.votes.length !== minVotes && 'disabled-btn'}`}
                    disabled={this.state.votes.length !== minVotes}
                    onClick={this.endDeclare}
                >
                    Get Score
                </button>
            }
        }

        return (
            <div className='main-container vote playroom'>
                <h2 className='playroom-label'>{declarer} Declared</h2>
                <section className='vote-container'>
                    <p> Please vote once a guess is submitted.
                        All players must agree for {declarer}'s team to earn a point. 
                        (No lying!)
                    </p>
                    <div className='playroom-section vote-section'>
                        <label>Your cards:</label>
                        <div className='mini-cards'>
                            {this.createHand(hand)}
                        </div>
                    </div>
                    <div className='playroom-section vote-section'>
                        {filler}
                        {guesses}
                    </div>
                    <div className='playroom-section vote-section'>
                        {votes}
                    </div>
                </section>
                {voteButtons}

            </div>
        )
    }
}

const mapStateToProps = (state) => ({
    name: state.user.name,
    index: state.user.index,
    roomkey: state.roomkey,
    hand: state.hand,
});

export default connect(mapStateToProps)(DecResponse);