import React, { Component } from "react";
import GlobalContext from '../../context/GlobalContext';
import { nameOfCard } from '../../game-utilities';

const PARITY_TO_TEAM = { "even": "BLUE", "odd": "RED" };
const FACES = [':)', '•_•', '=U','°_o',':O','°Д°'];

class GameHistory extends Component {

    static contextType = GlobalContext; 
    
    constructor(props){
        super(props);
        this.state = {};
    }

    createHistory = (history, all) => {
        return history.map((move, i) => {
            if (move.type === 'ASK')
                return (
                    <div key={i} className={`message history_move ${all? "left":""}`}>
                        <div className={`message_img ${
                            move.asker.index % 2 == 0? 'team-even' : 'team-odd'}`}>
                            {FACES[move.asker.index]} 
                        </div>
                        <div className={`message_info ${!all && 'main-view'}`}>
                            <div className={`message_info-sender history_move-who ${all ? "more-space": ""}`}>
                                {move.asker.name} asked 
                            </div>
                            <div className="message_info-content history_move-what">
                                {move.recipient} do you have the {nameOfCard(move.card)}?
                            </div>
                        </div>
                    </div>
                );
            else {
                const result = move.success ? "did" : "did not";
                return (
                    <React.Fragment key={i}>
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
                            {move.responder.name} {result} have the {nameOfCard(move.card)}
                        </div>
                    </React.Fragment>
                );
            }
        });
    }

    createTurnInfo = (whoseTurn, turnType) => {
        if (this.context.winner !== '') {
            return <label className='turn-type'>
                {`GAME OVER! Team ${PARITY_TO_TEAM[this.context.winner]} won!`}
            </label>
        }
        return <label className='turn-type'>
            {`It is ${whoseTurn}'s turn to ${turnType}`}
        </label>
    }

    render() {
        const { all } = this.props;
        const {
            history,
            whoseTurn,
            turnType,
        } = this.context;
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

export default GameHistory;
