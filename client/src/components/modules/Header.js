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
            onClickDeclare,
            onClickAsk,
            onClickRespond,
        } = this.props;

        const viewCards = (
            <button 
                className={`short-btn primary-btn header-btn ${view === 'hand' && 'active-btn'}`}
                onClick={() => this.props.changeView('hand')}>
                View Hand
            </button>);
        const declare = (
            <button 
                className={`short-btn primary-btn header-btn ${!showDeclare && 'disabled-btn'} ${view === 'declare' && 'active-btn'}`}
                onClick={() => this.props.changeView('declare')}
                disabled={!showDeclare}>
                Declare
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