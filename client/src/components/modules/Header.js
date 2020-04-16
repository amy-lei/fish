import React, { Component } from "react";
import logo from "../../public/logo.svg";
import "../styles/header.scss";

class Header extends Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    render() {
        const declare = (<button className="btn short-btn primary-btn header-btn" onClick={this.props.onClickDeclare}>Declare</button>);
        const ask = (<button className="btn short-btn alert-btn header-btn" onClick={this.props.onClickAsk}>Ask</button>);
        const respond = (<button className="btn short-btn alert-btn header-btn" onClick={this.props.onClickRespond}>Respond</button>);
        let buttons;
        if (this.props.gameBegan && !this.props.gameOver) {
            buttons = (
                <div className="header-btns">
                    {this.props.showDeclare && declare}
                    {this.props.showAsk && ask}
                    {this.props.showRespond && respond}
                </div>
            )
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