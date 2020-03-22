import React, { Component } from "react";
import "../../utilities.css";

class RoomForm extends Component {
    constructor(props) {
        super(props);
        this.state = {
            nameValue: "",
            keyValue: "",
        };
    };

    nameChange = (e) => {
        this.setState({
            nameValue: e.target.value,
        });
    }

    keyChange = (e) => {
        this.setState({
            keyValue: e.target.value,
        });
    }

    render() {
        return (
            <div>
                <h3> {this.props.title} </h3>
                Room Name: 
                <input
                    type="text"
                    value={this.state.nameValue}
                    onChange={this.props.nameChange}
                />
                <br/>
                Key:
                <input
                    type="text"
                    value={this.state.keyValue}
                    onChange={this.props.keyChange}
                />
                <button
                    onSubmit={() => this.props.enterRoom(this.state.nameValue, this.state.keyValue)}
                >
                    Go
                </button>

            </div>
        )
    }
}

class Game extends Component {
    constructor(props) {
        super(props);
        this.state = {
            start: false,
            enteredRoom: false,
            isCreatingRoom: false,
            roomName: null,
            roomKey: "",
            playerName: "",
            playerPassword: "",
        };
    };

    
    render() {
        let roomForm; 
        isCreatingRoom ? 
            roomForm = (
                <RoomForm
                    title="Create your own room"
                />
            ) 
            : roomForm = (
                <div>
                    <h3> Welcome back! </h3>
                    Username:
                    <input
                        type="text"
                        onChange={this.handlePlayerNameOnChange}
                        value={this.state.username}
                    />
                    <br/>
                    Password:
                    <input
                        type="text"
                        onChange={this.handlePlayerNameOnChange}
                        value={this.state.username}
                    />
                    
                </div>
            );

        
        return (
            <div>Hello World</div>
        );
    };
}

export default Game;