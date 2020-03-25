import React, { Component } from "react";

class NameForm extends Component {
    constructor(props) {
        super(props);
        this.state = {
            name:""
        };
    };

    nameChange = (e) => {
        this.setState({
            name: e.target.value.toUpperCase(),
        });
    };


    render() {
        return (
            <div className={"nameform-container"}>
                <div className={"name-label"}>Enter your name:</div>
                <input
                    type="text"
                    onChange={this.nameChange}
                    value={this.state.name}
                    className={"name-input"}
                    maxLength={10}
                />
                <br/>
                <button onClick={() => this.props.submitName(this.state.name)} className={"name-submit"}>
                    Enter Room
                </button>
            </div>
        )
    }
}

export default NameForm;