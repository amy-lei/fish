import React, { Component } from "react";
import logo from "../../public/logo.svg";
import "../styles/header.scss";

const PARITY_TO_TEAM = { "even": "BLUE", "odd": "RED" };

class Header extends Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    render() {
        const declare = (<button className="btn short-btn primary-btn header-btn" onClick={this.props.onClickDeclare}>Declare</button>);
        const ask = (<button className="btn short-btn alert-btn header-btn" onClick={this.props.onClickAsk}>Ask</button>);
        const respond = (<button className="btn short-btn alert-btn header-btn" onClick={this.props.onClickRespond}>Respond</button>);
        const gameOver = this.props.winner !== '';
        let buttons;
        if (this.props.gameBegan && !gameOver) {
            buttons = (
                <div className="header-btns">
                    {this.props.showDeclare && declare}
                    {this.props.showAsk && ask}
                    {this.props.showRespond && respond}
                </div>
            )
        }

        let winner;
        if (gameOver) {
            winner = <span>Game Over! Team {PARITY_TO_TEAM[this.props.winner]} won!</span>
        }

        return (
            <div className="header"> 
                <img className="header-logo logo" src={logo}/>
                {buttons}
                {winner}
            </div>
        );
    }
}

export default Header;