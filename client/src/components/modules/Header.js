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
            showAsk,
            showRespond,
            showDeclare,
            showCards,
            onClickDeclare,
            onClickAsk,
            onClickRespond,
        } = this.props;

        const viewCards = (
            <button 
                className={`short-btn primary-btn header-btn ${showCards ? 'active-btn' : ''}`}>
                View Hand
            </button>);
        const declare = (
            <button 
                className={`short-btn primary-btn header-btn ${!showDeclare && 'disabled-btn'}`}
                onClick={onClickDeclare}
                disabled={!showDeclare}>
                Declare
            </button>);
        const ask = (
            <button 
                className={`short-btn primary-btn header-btn ${!showAsk && 'disabled-btn'}`}
                onClick={onClickAsk}
                disabled={!showAsk}>
                    Ask
            </button>);
        const respond = (
            <button 
                className={`short-btn primary-btn header-btn ${!showRespond && 'disabled-btn'}`}
                onClick={onClickRespond}
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