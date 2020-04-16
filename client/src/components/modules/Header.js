import React, { Component } from "react";
import logo from "../../public/logo.svg";

class Header extends Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    render() {
        return (
            <div className="header"> 
                <img className="header-logo logo" src={logo}/>
            </div>
        );
    }
}

export default Header;