import React, { Component } from "react";
import { isValidDeclare, separateHalfSuit } from "../../game-utilities";
import { post } from "../../utilities";
import { connect } from 'react-redux';
import { card_svgs } from '../card_svgs';
import { halfSuits } from '../card_objs';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

import "../styles/game.scss";
import "../styles/cards.scss";
import "../styles/declare.scss";

class Declare extends Component {
    constructor(props){
        super(props);
        this.state = {
            guess: [],
            halfSuit: null,
            hide: false,
            availableCards: null,
            ownCards: null,
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
            declaring: true,
        });
        
        post("/api/pause", {key: this.props.roomkey, player: this.props.name});
    }

    // validate the declare before announcing 
    confirm = async () => {
        if (isValidDeclare(this.state.guess)) {
            this.setState({invalid: false, declaring: false,});
            await post("/api/declare", {guess: this.state.guess, key: this.props.roomkey});
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
        this.setState({guess});
        post("/api/pause", {key: this.props.roomkey, player: this.props.name});

    }

    createHand = (hand) => {
        return hand.map((card,i) => (
            <img 
                key={i}
                className={`mini-card ${this.state.selectedCard === card && 'selected-card'}`} 
                src={card_svgs[`${card.rank}-${card.suit}.svg`]}
            />
        ));
    };

    createHalfSuitOptions = () => {
        return Object.keys(halfSuits).map((halfSuit, i) => (
            <div 
                key={i} 
                className={`playroom-option halfsuit ${this.state.halfSuit === halfSuit && 'selected-card'}`}
                value={halfSuit}
                onClick={() => {
                    this.setState({halfSuit})
                    this.splitHand(halfSuit)
                }}
            >
                {halfSuit.replace('_', ' ')}
            </div>
        ))
    }

    splitHand = (halfSuit) => {
        const { hand } = this.props;
        const { availableCards, ownCards } = separateHalfSuit(hand, halfSuits[halfSuit]);
        this.setState({ availableCards, ownCards });
    }

    createHalfSuits = () => {
        const { availableCards  } = this.state;
        if (availableCards && availableCards.length > 0) {
            return availableCards
                .map((card,i) => (
                    <img 
                        key={i}
                        className={`mini-card`} 
                        src={card_svgs[`${card.rank}-${card.suit}.svg`]}
                    />
                ));
        } else {
            const cards = [];
            for (let i = 0; i < 6; i++) {
                cards.push(<div key={i} className='mini-card placeholder-card'></div>);
            }
            return cards;
        }
    }

    createPlayerColumns = () => {
        const { yourTeam, name } = this.props;
        const { ownCards } = this.state;

        return yourTeam.map((player, i) => 
            <div className='declare-column'>
                <label>{player.name}</label>
                <div key={i} className='declare-input_player'>
                    {ownCards && player.name === name 
                        && [...ownCards].map((card, i) =>
                        <img 
                            key={i}
                            className={`mini-card`} 
                            src={card_svgs[`${card.rank}-${card.suit}.svg`]}
                        />)} 
                </div>
            </div>
        )
    }
    render() {
        return(
            <div className='main-container declare playroom'>
                <h2 className='playroom-label'>Declare!</h2>
                <section className='declare-container'>
                    <div className='declare-section'>
                        <label>Choose a half-suit:</label>
                        <div className='playroom-options'>
                            {this.createHalfSuitOptions()}
                        </div>
                    </div>
                    <div className='declare-section declare-input_cards'>
                        <label>Drag each card to the player you believe has it</label>
                        <div className='mini-cards'>
                            {this.createHalfSuits()}
                        </div>
                    </div>
                    <div className='declare-section declare-input_players'>
                        {this.createPlayerColumns()}
                    </div>
                </section>
                <button className="btn primary-btn long-btn playroom-btn" onClick={this.confirm}>
                    Declare
                </button>
            </div>
        )

        return(
            <>            
                {this.state.declaring &&
                    <button
                        className="btn primary-btn show-cards-btn"
                        onClick={() => this.setState({hide: !this.state.hide})}
                    >
                        {!this.state.hide ? "View Cards" : "Resume Declare"}
                    </button>
                }
            <div className={`popup ${this.state.hide ? "hidden" : ""}`}>
                {!this.state.showInput && !this.state.declaring ? confirmation : <div className="declare-inputs">{inputs}</div>}
                {this.state.showInput && 
                    <button className="btn primary-btn" onClick={this.confirm}>
                        Declare
                    </button>}
                {this.state.invalid && "invalid declare!!!"}
            </div></>);

    }
}

const mapStateToProps = (state) => ({
    name: state.user.name,
    index: state.user.index,
    hand: state.hand,
    roomkey: state.roomkey,
    yourTeam: state.teams.yourTeam,
});

export default connect(mapStateToProps)(Declare);