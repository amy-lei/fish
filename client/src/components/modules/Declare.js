import React, { Component } from "react";
import { separateHalfSuit } from "../../game-utilities";
import { post } from "../../utilities";
import { connect } from 'react-redux';
import { card_svgs } from '../card_svgs';
import { halfSuits } from '../card_objs';

class Declare extends Component {
    constructor(props){
        super(props);
        this.state = {
            guess: {},
            halfSuit: null,
            availableCards: null,
        };
    }
    
    onDragStart = (e, rank, suit, source) => {
        e.dataTransfer.setData('rank', rank);
        e.dataTransfer.setData('suit', suit);
        e.dataTransfer.setData('source', source);
    }

    onDragOver = (e) => {
        e.preventDefault();
    }

    onDrop = (e, name) => {
        const rank = e.dataTransfer.getData('rank');
        const suit = e.dataTransfer.getData('suit');
        const source = e.dataTransfer.getData('source');
        
        // location did not change
        if (name === source || name === 'cards') {
            return; 
        }
        
        let draggedCard; 
        const filteredCards = [];
        const guess = {...this.state.guess};
        let availableCards;
        const sourceList = source === 'cards' ? this.state.availableCards : this.state.guess[source];
        for (let card of sourceList) {
            if (card.rank === rank && card.suit === suit) {
                draggedCard = card;
            } else {
                filteredCards.push(card);
            }
        }

        if (source === 'cards') {
            availableCards = filteredCards;
        } else {
            availableCards = this.state.availableCards;
            guess[source] = filteredCards;
        }

        guess[name] = this.state.guess[name].concat(draggedCard);        
        this.setState({
            availableCards,
            guess,
        });
    }


    // validate the declare before announcing 
    confirm = async () => {
        this.setState({invalid: false, declaring: false,});
        await post("/api/declare", {
            halfSuit: this.state.halfSuit, 
            guess: this.state.guess, 
            key: this.props.roomkey
        });
        this.props.changeView('vote');
    }

    resetGuesses = (callback) => {
        const { yourTeam } = this.props;
        const guess = {};
        for (let player of yourTeam) {
            guess[player.name] = [];
        }
        this.setState({ guess }, callback);
    }

    componentDidMount() {
        this.resetGuesses(() => {});
        post("/api/pause", {key: this.props.roomkey, player: this.props.name});
    }

    
    createHand = (hand) => {
        return hand.map((card,i) => (
            <div draggable={true}>
                <img 
                    key={i}
                    className={`mini-card ${this.state.selectedCard === card && 'selected-card'}`} 
                    src={card_svgs[`${card.rank}-${card.suit}.svg`]}
                />
            </div>
        ));
    };

    createHalfSuitOptions = () => {
        return Object.keys(halfSuits).map((halfSuit, i) => (
            <div 
                key={i} 
                className={`playroom-option halfsuit ${this.state.halfSuit === halfSuit && 'selected-card'}`}
                value={halfSuit}
                onClick={() => {
                    this.setState({halfSuit});
                    this.splitHand(halfSuit);
                }}
            >
                {halfSuit.replace('_', ' ')}
            </div>
        ))
    }

    splitHand = (halfSuit) => {
        this.resetGuesses(() => {
            const { name, hand } = this.props;
            const { availableCards, ownCards } = separateHalfSuit(hand, halfSuits[halfSuit]);
            const guess = {...this.state.guess};
            guess[name] = this.state.guess[name].concat([...ownCards]);
            this.setState({ availableCards, guess });
        });
    }

    createHalfSuits = () => {
        const { availableCards  } = this.state;
        if (availableCards && availableCards.length > 0) {
            return availableCards
                .map((card,i) => (
                    <div draggable>
                        <img 
                            key={i}
                            className={`mini-card`} 
                            src={card_svgs[`${card.rank}-${card.suit}.svg`]}
                            onDragStart={(e) => this.onDragStart(e, card.rank, card.suit, 'cards')}
                        />
                    </div>
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
        const { yourTeam } = this.props;
        const { guess } = this.state;

        return yourTeam.map((player, i) => 
            <div className='declare-column'>
                <p>{player.name}</p>
                <div 
                    key={i} 
                    className='declare-input_player'
                    onDragOver={(e) => this.onDragOver(e)}
                    onDrop={(e) => this.onDrop(e, player.name)}
                >
                    {guess[player.name] && guess[player.name].map((card, i) =>
                        <img 
                            key={i}
                            className={`mini-card`} 
                            src={card_svgs[`${card.rank}-${card.suit}.svg`]}
                            onDragStart={(e) => this.onDragStart(e, card.rank, card.suit, player.name)}
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
                    <div className='playroom-section declare-section'>
                        <label>Choose a half-suit:</label>
                        <div className='playroom-options'>
                            {this.createHalfSuitOptions()}
                        </div>
                    </div>
                    <div className='playroom-section declare-section declare-input_cards'>
                        <label>Drag each card to the player you believe has it</label>
                        <div 
                            className='mini-cards'
                            onDragOver={(e) => this.onDragOver(e)}
                            onDrop={(e) => this.onDrop(e, 'cards')}
                        >
                            {this.createHalfSuits()}
                        </div>
                    </div>
                    <div className='playroom-section declare-section declare-input_players'>
                        {this.createPlayerColumns()}
                    </div>
                </section>
                <button 
                    className={`btn primary-btn long-btn playroom-btn ${!this.state.availableCards || this.state.availableCards.length > 0 ? 'disabled-btn' : ''}`}
                    disabled={!this.state.availableCards || this.state.availableCards.length > 0}
                    onClick={this.confirm}
                    >
                    Declare
                </button>
            </div>
        );
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