import React, { Component } from "react";
import { card_svgs } from '../card_svgs';
import GameStats from './GameStats';
import GameHistory from './GameHistory';

class ViewHand extends Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    createCards = (hand) => {
        return hand.map(card => (
            <div className={`card card-${hand.length}`}>
                <img src={card_svgs[`${card.rank}-${card.suit}.svg`]}/>
            </div>
        ));
    };
    
    render() {
        return (
            <div className='main-container playroom'>
                <GameHistory all={false}/>
                <div className='cards'>
                    {this.createCards(this.props.hand)}
                </div>
                <GameStats/>
            </div>
        );
    }
}


export default ViewHand;