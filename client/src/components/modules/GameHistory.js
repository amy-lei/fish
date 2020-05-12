import React, { Component } from "react";
import { connect } from 'react-redux';

const FACES = [':)', '•_•', '=U','°_o',':O','°Д°'];

class GameHistory extends Component {
    constructor(props){
        super(props);
        this.state = {};
    }

    render() {
        const history = this.props.history.map(move => {
            if (move.type === 'ASK')
                return (
                    <div className={`message history_move ${this.props.all?"left":""}`}>
                        <div className={`message_img ${
                            move.asker.index % 2 == 0? 'team-even' : 'team-odd'}`}>
                            {FACES[move.asker.index]} 
                        </div>
                        <div className="message_info">
                            <div className={`message_info-sender history_move-who ${this.props.all ? "more-space": ""}`}>
                                {move.asker.name} asked 
                            </div>
                            <div className="message_info-content history_move-what">
                                {move.recipient} do you have the {move.rank} {move.suit}?
                            </div>
                        </div>
                    </div>
                );
            else {
                const result = move.success ? "did" : "did not";
                return (
                    <>
                        <div className={`message history_move ${this.props.all?"left":""}`}>
                            <div className={`message_img ${
                                move.responder.index % 2 == 0? 'team-even' : 'team-odd'}`}>
                                {FACES[move.responder.index]} 
                            </div>
                            <div className="message_info">
                                <div className={`message_info-sender history_move-who ${this.props.all ? "more-space": ""}`}>
                                    {move.responder.name} said
                                </div>
                                <div className="message_info-content history_move-what">
                                    {move.response}
                                </div>
                            </div>
                        </div>
                        <div className="server-message history_move-result">
                            {move.responder.name} {result} have the {move.rank} {move.suit}
                        </div>
                    </>
                );
            }
        });
        return (
            <div className={`messages history ${this.props.hidden ? "hidden" : ""}`} hidden={this.props.hidden}>
                {this.props.all 
                    ? history
                    : history[history.length - 1]}
            </div>
        );
    }
}

const mapStatesToProps = (state) => ({
    history: state.history,
});

export default connect(mapStatesToProps)(GameHistory);
