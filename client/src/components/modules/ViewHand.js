import React, { Component } from "react";
import { card_svgs } from '../card_svgs';
import GameStats from './GameStats';
import GameHistory from './GameHistory';
import GlobalContext from '../../context/GlobalContext';
import { socket } from '../../client-socket';

class ViewHand extends Component {
    static contextType = GlobalContext;
    constructor(props) {
        super(props);
        this.state = {
            source: -1,
            hand: [],
        };
    }
    componentDidMount() {
        this.setState({ hand: this.context.hand });
        socket.on('respond', (game) => {
            this.setState({ hand: game.hands[this.context.index] });
        });
    }

    onDragStart = (e, index) => {
        e.dataTransfer.setData('source', index);
        this.setState({ source: index });
    };

    onDragOver = (e, index) => {
        e.preventDefault();
        const { source, hand } = this.state;
        if (source !== index) {
            let currentHand = hand.slice();
            const card = currentHand[source];
            currentHand.splice(source, 1);
            currentHand.splice(index, 0, card);
            this.setState({
                hand: currentHand,
                source: index,
            });
        }
    };

    onDrop = (e, destination) => {
        let currentHand = this.context.hand.slice();
        const source = e.dataTransfer.getData("source");
        const droppedCard = currentHand[source];
        currentHand.splice(source, 1);
        currentHand.splice(destination, 0, droppedCard);
        this.context.setHand(currentHand);
        this.setState({ hand: currentHand, source: -1 });
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
                    {this.createCards(this.state.hand)}
                </div>
                <GameStats/>
            </div>
        );
    }
}


export default ViewHand;