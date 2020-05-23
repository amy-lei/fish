import React, { Component } from "react";
import { post } from "../../utilities";
import { socket } from "../../client-socket";
import GlobalContext from '../../context/GlobalContext';

class NameForm extends Component {

    static contextType = GlobalContext;

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

    submitName = (e) => {
        const { clickedButton, name } = this.state;

        if (clickedButton || name.trim() === "") {
            return;
        }
        if (!e || e.key === "Enter") {
            this.setState({clickedButton: true}, 
                () => {
                    this.context.isCreator 
                        ? this.createRoom(name)
                            : this.enterRoom(name)
                });
        }
    };

    createRoom = async (name) => {
        const trimmedName = name.trim();
        if (trimmedName === "") {
          return;
        }
        const body = {
            creatorName: name,
            socketid: socket.id,
        };
        const game = await post('/api/create_room', body);
        this.context.createRoom(name, game);
        this.props.redirect('lobby');
    };

    enterRoom = async (name) => {
        const trimmedName = name.trim();
        if (trimmedName === "") {
          return;
        }
        const body = {
            playerName: name,
            room_key: this.context.roomkey,
            socketid: socket.id,
        };
        const roomInfo = await post('/api/join_room', body);
        this.context.enterRoom(roomInfo);
        if (roomInfo.game.start) {
            this.props.redirect('play');
        } else {
            this.props.redirect('lobby');
        }
    }

    render() {
        return (
            <>
                <div className="name-label">Enter your name:</div>
                <div className="input-btn-wrapper name">
                    <input
                        type="text"
                        onChange={this.nameChange}
                        value={this.state.name}
                        className="input-btn-field"
                        maxLength={10}
                        onKeyPress={(e) => this.submitName(e)}
                    />
                    <button
                        onClick={() => this.submitName(null)}
                        className={`btn primary-inverted-btn input-btn-submit ${this.state.clickedButton ? "disabled-name" : ""}`}
                        disabled={this.state.clickedButton}
                    >
                        Join
                    </button>
                </div>
            </>
        )
    }
}

export default NameForm;