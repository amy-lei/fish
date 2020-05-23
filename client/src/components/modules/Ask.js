import React, { Component } from "react";
import { post } from "../../utilities";
import { card_svgs } from '../card_svgs';
import { halfSuits } from '../card_objs';
import { hasCard } from '../../game-utilities'; 
import GlobalContext from '../../context/GlobalContext';

class Ask extends Component {

    static contextType = GlobalContext;

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
        const { roomkey, name, index } = this.context;
        const body = {
            key: roomkey,
            asker: { name, index },
            recipient, 
            card: askedCard,
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
        const { selectedCard, askedCard } = this.state;
        const { hand } = this.context;
        if (selectedCard) {
            return halfSuits[selectedCard.halfSuit]
                .filter((card) => 
                    !(card.rank === selectedCard.rank && card.suit === selectedCard.suit) 
                    && !hasCard(hand, card).have
                )
                .map((card,i) => (
                    <img 
                        key={i}
                        className={`mini-card ${askedCard === card && 'selected-card'}`} 
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
        const { otherTeam } = this.context;
        return otherTeam.map((player, i) => {
            let onClick;
            if (player.active) {
                onClick = () => this.setState({ recipient: player.name })
            } else {
                onClick = () => {};
            }
            return (<div 
                key={i}
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
                            {this.createHand(this.context.hand)}
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

export default Ask;