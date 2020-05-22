import React, { Component } from "react";
import { connect } from 'react-redux';
import { hasCard, nameOfCard } from "../../game-utilities";
import { post } from "../../utilities";
import { card_svgs } from '../card_svgs';

class Respond extends Component {
    constructor(props){
        super(props);
        this.state = {
            response: "",
        };
    }

    /*
        Submit response
        and reset states related to respond
     */
    respond = async () => {
        const { 
            history, 
            hand, 
            name, 
            index, 
            roomkey } = this.props;
        const lastAsk = history[history.length - 1]
        const card = lastAsk.card;
        const { have } = hasCard(hand, card);
        const body = {
            key: roomkey,
            responder: {name, index},
            asker: lastAsk.asker,
            response: this.state.response,
            success: have,
            card,
        };
        await post("/api/respond", body);
        this.setState({
            response: "",
        });
        this.props.reset('hand');
    }

    createHand = (hand) => {
        return hand.map((card,i) => (
            <img 
                key={i}
                className={`mini-card`} 
                src={card_svgs[`${card.rank}-${card.suit}.svg`]}
            />
        ));
    };

    render() {
        const asker = this.props.history.length !== 0 ? this.props.history[this.props.history.length - 1].asker.name : '';
        return (
            <div className='main-container playroom respond'>
                <h2 className="playroom-label">Respond to {asker}:</h2>
                <section className='respond-container'>
                    <div className='playroom-section respond-section'>
                        <label>Your cards:</label>
                        <div className='mini-cards'>
                            {this.createHand(this.props.hand)}
                        </div>
                    </div>
                    <div className='playroom-section respond-section'>
                        <label>
                            {asker} asked for the {nameOfCard(this.props.history[this.props.history.length - 1].card)}
                            . Respond with a message:
                        </label>
                        <input 
                            className="respond-input"
                            type="text"
                            onChange={(e) => this.setState({response: e.target.value})}
                            value={this.state.response}
                        />
                    </div>
                </section>
                <button 
                    className="btn primary-btn long-btn playroom-btn" 
                    onClick={this.respond}
                >
                    Respond
                </button>
            </div>
        );
    }
}

const mapStatesToProps = (state) => ({
    name: state.user.name,
    index: state.user.index,
    roomkey: state.roomkey,
    hand: state.hand,
    history: state.history,
});


export default connect(mapStatesToProps)(Respond);