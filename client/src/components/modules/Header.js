import React, { Component } from "react";
import logo from "../../public/logo.svg";

const PARITY_TO_TEAM = { "even": "BLUE", "odd": "RED" };

class Header extends Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    render() {
        const {
            winner,
            gameBegan,
            showAsk,
            showRespond,
            showDeclare,
            onClickDeclare,
            onClickAsk,
            onClickRespond,
        } = this.props;

        const declare = (<button className="btn short-btn primary-btn header-btn" onClick={onClickDeclare}>Declare</button>);
        const ask = (<button className="btn short-btn alert-btn header-btn" onClick={onClickAsk}>Ask</button>);
        const respond = (<button className="btn short-btn alert-btn header-btn" onClick={onClickRespond}>Respond</button>);
        const gameOver = winner !== '';

        let buttons;
        if (gameBegan && !gameOver) {
            buttons = (
                <div className="header-btns">
                    {showDeclare && declare}
                    {showAsk && ask}
                    {showRespond && respond}
                </div>
            )
        }

        let gameStatus;
        if (gameOver) {
            gameStatus = <span>Game Over! Team {PARITY_TO_TEAM[this.props.winner]} won!</span>
        }

        return (
            <div className="header"> 
                <img className="header-logo logo" src={logo}/>
                {buttons}
                {gameStatus}
            </div>
        );
    }
}

export default Header;