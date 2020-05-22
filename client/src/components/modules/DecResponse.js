import React, { Component } from "react";
import { post } from "../../utilities";
import { canObject } from "../../game-utilities";
import { socket } from "../../client-socket";
import { connect } from 'react-redux';
import { card_svgs } from '../card_svgs';

class DecResponse extends Component {
    constructor(props){
        super(props);
        this.state = {
            lieAboutAccept: false,
            lieAboutObject: false,
            votes: { agree: 0, object: 0 },
            voted: false,
        };
    }
    /*
        STEP 1 of declaring: 
        Submit response to the declare and alert others. 
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
        if (bool) {
            if (!canObject(hand, guess, name)) await post("/api/vote", body);
            else this.setState({ lieAboutAccept: true });
        }
        else {
            // validate objections first
            if (canObject(hand, guess, name)){
                await post("/api/vote", body);
                this.setState({lieAboutObject: false});
            } 
            else this.setState({lieAboutObject:true}); 
        }
    }
    /*
        STEP 2 of declaring:
        Once everyone has voted, check for any objections
        (which results in other team gaining the point) and announce results.

     */
    endDeclare = async () => {
        // check for objections
        const objections = this.state.votes.object > 0;
        const even = this.props.index % 2 === 0; // your team
        const body = {
            even: objections ? !even : even,
            key: this.props.roomkey, 
            halfSuit: this.props.halfSuit,
        };
        // reset declaring states
        this.setState({
            lieAboutObject: false,
            voted: false,
            votes: [],
        });
        await post("/api/score", body);
    }

    componentDidMount() {
        // update when someone submits their res to declare
        socket.on("vote", vote => {
            const { votes } = this.state;
            if (vote.name === this.props.name) this.setState({voted: true});
            this.setState({ votes: {
                agree: vote.agree ? votes.agree + 1 : votes.agree,
                object: vote.agree ? votes.object : votes.object + 1,
            }});
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

        const {
            votes,
            voted,
            lieAboutObject,
            lieAboutAccept,
        } = this.state;

        let filler;
        let guesses;
        let voteButtons;
        let voteResults;
        let instructions;
        if (Object.keys(guess).length === 0) {
            filler = <label className='vote-filler'>
                {declarer} is guessing
            </label>

            instructions = <p> Please vote once a guess is submitted. 
                (No lying! Both buttons will be there for show.)
                All players must agree for {declarer}'s team to earn a point. 
            </p>
        } else {
            guesses = <>
                <label>Declaration:</label>
                <div className='vote-guesses declare-input_players'>
                    {this.createGuesses(guess)}
                </div>
            </>
            
            voteResults = 
                <div className='vote-res_container'>
                        {Object.keys(votes).map((op) => 
                        <div className='vote-res_category'>
                            <label>{op}</label>
                            <div className={`vote-res_bar vote-res_bar-${votes[op]} ${op}`}></div>
                            <p className='vote-res_amount'>{votes[op]}</p>
                       </div>)}
                </div>;

            if (declarer !== name) {
                voteButtons = <div className='vote-btns'>
                    <button
                        className={`primary-btn short-btn vote-btn ${(voted || lieAboutAccept) && 'disabled-btn'}`}
                        disabled={voted || lieAboutAccept}
                        onClick={() => this.resToDeclare(true)}
                    >
                        Agree
                    </button>
                    <button
                        className={`primary-btn short-btn vote-btn ${(voted || lieAboutObject) && 'disabled-btn'}`}
                        disabled={voted || lieAboutObject}
                        onClick={() => this.resToDeclare(false)}
                    >
                        Object
                    </button>
                </div>
            } else {
                voteButtons = <button
                    className={`primary-btn long-btn ${(votes.agree + votes.object) !== minVotes && 'disabled-btn'}`}
                    disabled={(votes.agree + votes.object) !== minVotes}
                    onClick={this.endDeclare}
                >
                    Get Score
                </button>
            }
        }
        let lieWarning;
        if ((lieAboutAccept || lieAboutObject) && !voted ) {
            lieWarning = <p className='warning'>Don't lie! Please vote again, but correctly.</p>
        }
        return (
            <div className='main-container vote playroom'>
                <h2 className='playroom-label'>{declarer} Declared</h2>
                <section className='vote-container'>
                    {instructions}
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
                        {voteResults}
                    </div>
                </section>
                {voteButtons}
                {lieWarning}
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