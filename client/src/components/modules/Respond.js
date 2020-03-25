import React, { Component } from "react";

import "../styles/game.scss";
import "../styles/cards.scss";
import "../styles/respond.scss";

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
                <button
                    className="close-btn"
                    onClick={this.props.reset}
                >
                    X
                </button>
                <div className="respond">
                    <div className="respond-label">Respond to {this.props.asker}:</div>
                    
                    <input 
                        className="respond-input"
                        type="text"
                        onChange={(e) => this.setState({response: e.target.value})}
                        value={this.state.response}
                    />
                </div>
                <button className="btn primary-btn" onClick={this.respond}>
                    Send
                </button>
            </div>
        );
    }
}

export default Respond;