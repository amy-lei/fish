import React, { Component } from "react";
import logo from "../../public/header_logo.svg";

const PARITY_TO_TEAM = { "even": "BLUE", "odd": "RED" };

class Header extends Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    render() {
        const {
            winner,
            view,
            showAsk,
            showRespond,
            showDeclare,
        } = this.props;

        const viewCards = (
            <button 
                className={`short-btn primary-btn header-btn ${!showDeclare && 'disabled-btn'} ${view === 'hand' && 'active-btn'}`}
                onClick={() => this.props.changeView('hand')}
                disabled={!showDeclare}>
                Game
            </button>);
        const declare = (
            <button 
                className={`short-btn primary-btn header-btn ${!showDeclare && 'disabled-btn'} ${view === 'declare' && 'active-btn'}`}
                onClick={() => this.props.changeView('declare')}
                disabled={!showDeclare}>
                Declare
                {view !== 'declare' 
                && <span className='tooltip tooltip-left'>You cannot back out of a declare once you begin</span>
                }
            </button>);
        const ask = (
            <button 
                className={`short-btn primary-btn header-btn ${!showAsk && 'disabled-btn'} ${view === 'ask' && 'active-btn'}`}
                onClick={() => this.props.changeView('ask')}
                disabled={!showAsk}>
                    Ask
            </button>);
        const respond = (
            <button 
                className={`short-btn primary-btn header-btn ${!showRespond && 'disabled-btn'} ${view === 'respond' && 'active-btn'}`}
                onClick={() => this.props.changeView('respond')}
                disabled={!showRespond}>
                    Respond
            </button>);
        
        const gameOver = winner !== '';
        let buttons;
        if (!gameOver) {
            buttons = (
                <div className="header-btns">
                    {viewCards}
                    {declare}
                    {ask}
                    {respond}
                </div>
            );
        }

        return (
            <div className="header"> 
                <img className="header-logo logo" src={logo}/>
                {buttons}
            </div>
        );
    }
}

export default Header;