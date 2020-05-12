import React, { Component } from "react";
import { connect } from 'react-redux';
import { hasCard } from "../../game-utilities";
import { post } from "../../utilities";

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
        const card = { rank: lastAsk.rank, suit: lastAsk.suit };
        const success = hasCard(hand, card);
        const body = {
            key: roomkey,
            responder: {name, index},
            asker: lastAsk.asker,
            response: this.state.response,
            success,
            card,
        };
        await post("/api/respond", body);
        this.setState({
            response: "",
        });
        this.props.reset();
    }

    render() {
        const asker = this.props.history.length !== 0 ? this.props.history[this.props.history.length - 1].asker.name : '';
        return (
            <div className={`popup`}>
                <button
                    className="close-btn"
                    onClick={this.props.reset}
                >
                    X
                </button>
                <div className="respond">
                    <div className="respond-label">Respond to {asker}:</div>
                    
                    <input 
                        className="respond-input"
                        type="text"
                        onChange={(e) => this.setState({response: e.target.value})}
                        value={this.state.response}
                    />
                </div>
                <button className="btn primary-btn" onClick={this.respond}>
                    Send
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