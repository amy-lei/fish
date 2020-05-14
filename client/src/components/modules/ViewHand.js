import React, { Component } from "react";
import { card_svgs } from '../card_svgs';
import GameStats from './GameStats';
import GameHistory from './GameHistory';

class ViewHand extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    onDragStart = (e, index) => {
        e.dataTransfer.setData('source', index);
    };

    onDragOver = (e, index) => {
        e.preventDefault();
    };

    onDrop = (e, destination) => {
        let currentHand = this.props.hand.slice();
        const source = e.dataTransfer.getData("source");
        const droppedCard = currentHand[source];
        currentHand.splice(source, 1);
        currentHand.splice(destination, 0, droppedCard);
        this.props.updateHand(currentHand);
    };

    createCards = (hand) => {
        return hand.map((card, i) => (
            <div 
                key={i} 
                className={`card card-${hand.length}`}
                draggable={true}
                onDragStart={(e) => this.onDragStart(e, i)}
                onDragOver={(e) => this.onDragOver(e, i)}
                onDrop={(e) => this.onDrop(e, i)}
            >
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