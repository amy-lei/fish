import React, { Component } from "react";
import { connect } from 'react-redux';
import { post } from "../../utilities";
import { card_svgs } from '../card_svgs';
import { halfSuits } from '../card_objs';

import "../styles/game.scss";
import "../styles/cards.scss";

class Ask extends Component {
    constructor(props){
        super(props);
        this.state = {
            recipient: null,
            selectedCard: null,
            askedCard: null,
        };
    }

    ask = async() => {
        const { recipient, askedCard } = this.state;
        const { roomkey, name, index } = this.props;
        const body = {
            key: roomkey,
            asker: { name, index },
            recipient, 
            rank: askedCard.rank,
            suit: askedCard.suit,
        };
        const res = await post('/api/ask', body);
        this.setState({
            recipient: null,
            selectedCard: null,
            askedCard: null,
        });
        this.props.reset('hand');
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

    createHalfSuits = () => {
        const { selectedCard } = this.state;
        if (selectedCard) {
            return halfSuits[selectedCard.halfSuit]
                .filter((card) => 
                    !(card.rank === selectedCard.rank && card.suit === selectedCard.suit) 
                )
                .map((card,i) => (
                    <img 
                        key={i}
                        className={`mini-card ${this.state.askedCard === card && 'selected-card'}`} 
                        src={card_svgs[`${card.rank}-${card.suit}.svg`]}
                        onClick={() => this.setState({askedCard: card})}    
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

    createPlayers = () => {
        const { otherTeam } = this.props;
        return otherTeam.map((player) => {
            let onClick;
            if (player.active) {
                onClick = () => this.setState({ recipient: player.name })
            } else {
                onClick = () => {};
            }
            return (<div 
                className={`playroom-option player ${this.state.recipient === player.name && 'selected-card'} ${!player.active && 'out'}`}
                onClick={onClick}
            >
                 {player.name} {player.active ? '' : '(OUT)'}
            </div>)}
        );
    }

    render() {
        return (
            <div className='main-container ask playroom'>
                <h2 className='playroom-label'> Ask for a card</h2>
                <section className='ask-container'>
                    <div className='playroom-section ask-section ask-section_hand'>
                        <label>Select a half-suit from your hand:</label>
                        <div className='mini-cards'>
                            {this.createHand(this.props.hand)}
                        </div>
                    </div>
                    <div className='playroom-section ask-section ask-section_suit'>
                        <label>Select a card to ask for:</label>
                        <div className='mini-cards'>
                            {this.createHalfSuits()}
                        </div>
                    </div>
                    <div className='playroom-section ask-section ask-section_suit'>
                        <label>Select to a player to ask:</label>
                        <div className='playroom-options'>
                            {this.createPlayers()}
                        </div>
                    </div>

                </section>
                <button
                    className={`btn primary-btn long-btn playroom-btn ${!this.state.askedCard || !this.state.recipient ? 'disabled-btn' : ''}`}
                    onClick={this.ask}
                    disabled={!this.state.askedCard || !this.state.recipient}
                >
                    Ask
                </button>
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