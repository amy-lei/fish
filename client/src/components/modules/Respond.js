import React, { Component } from "react";

import "../styles/game.scss";
import "../styles/cards.scss";

class Respond extends Component {
    constructor(props){
        super(props);
        this.state = {
            response: "",
        };
    }

    /*
        Submit response
        and reset states related to respond
     */
    respond = () => {
        this.props.submitResponse(this.state.response);
        this.setState({
            response: "",
        });
        this.props.reset();
    }

    render() {
        return (
            <div className={`popup`}>
                Respond to {this.props.asker}:
                <input 
                    type="text"
                    onChange={(e) => this.setState({response: e.target.value})}
                    value={this.state.response}
                />
                <button onClick={this.respond}>
                    Send
                </button>
            </div>
        );
    }
}

export default Respond;