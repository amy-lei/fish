import React, { Component } from "react";

class NameForm extends Component {
    constructor(props) {
        super(props);
        this.state = {
            name: "",
            clickedButton: false,
        };
    };

    nameChange = (e) => {
        this.setState({
            name: e.target.value.toUpperCase(),
        });
    };

    submitName = () => {
        this.setState({clickedButton: true}, () => this.props.submitName(this.state.name));
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
                <button
                    onClick={this.submitName}
                    className={this.state.clickedButton ? "disabled-name" : "name-submit"}
                    disabled={this.state.clickedButton}
                >
                    Enter Room
                </button>
            </div>
        )
    }
}

export default NameForm;