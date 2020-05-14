import React, { Component } from "react";
import { connect } from 'react-redux';

const FACES = [':)', '•_•', '=U','°_o',':O','°Д°'];

class GameHistory extends Component {
    constructor(props){
        super(props);
        this.state = {};
    }

    createHistory = (history, all) => {
        return history.map(move => {
            if (move.type === 'ASK')
                return (
                    <div className={`message history_move ${all? "left":""}`}>
                        <div className={`message_img ${
                            move.asker.index % 2 == 0? 'team-even' : 'team-odd'}`}>
                            {FACES[move.asker.index]} 
                        </div>
                        <div className={`message_info ${!all && 'main-view'}`}>
                            <div className={`message_info-sender history_move-who ${all ? "more-space": ""}`}>
                                {move.asker.name} asked 
                            </div>
                            <div className="message_info-content history_move-what">
                                {move.recipient} do you have the {move.card.rank} {move.card.suit}?
                            </div>
                        </div>
                    </div>
                );
            else {
                const result = move.success ? "did" : "did not";
                return (
                    <>
                        <div className={`message history_move ${all?"left":""}`}>
                            <div className={`message_img ${
                                move.responder.index % 2 == 0? 'team-even' : 'team-odd'}`}>
                                {FACES[move.responder.index]} 
                            </div>
                            <div className={`message_info ${!all && 'main-view'}`}>
                                <div className={`message_info-sender history_move-who ${all ? "more-space": ""}`}>
                                    {move.responder.name} said
                                </div>
                                <div className="message_info-content history_move-what">
                                    {move.response}
                                </div>
                            </div>
                        </div>
                        <div className="server-message history_move-result">
                            {move.responder.name} {result} have the {move.card.rank} {move.card.suit}
                        </div>
                    </>
                );
            }
        });
    }

    createTurnInfo = (whoseTurn, turnType) => {
        return <label className='turn-type'>
            {`It is ${whoseTurn}'s turn to ${turnType}`}
        </label>
    }

    render() {
        const {
            history,
            all,
            whoseTurn,
            turnType,
        } = this.props;
        const historyInfo = this.createHistory(history, all);

        return (
            <div className={`messages history ${!all && 'history-main-view'} ${this.props.hidden ? "hidden" : ""}`}>
                {!all && this.createTurnInfo(whoseTurn, turnType)}
                {all 
                    ? historyInfo
                    : historyInfo[historyInfo.length - 1]}
            </div>
        );
    }
}

const mapStatesToProps = (state) => ({
    history: state.history,
    whoseTurn: state.turnInfo.whoseTurn,
    turnType: state.turnInfo.turnType,
});

export default connect(mapStatesToProps)(GameHistory);
