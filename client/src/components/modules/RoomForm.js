import React, { Component } from "react";
import { post } from "../../utilities";
import { connect } from 'react-redux';
import { setRoomKey } from '../../actions/gameActions';

class RoomForm extends Component {
    constructor(props) {
        super(props);
        this.state = {
            roomKey: "",
            wantToJoinRoom: false,
            roomKeyError: false,
        };
    }

    createRoom = () => {
        this.props.changeView();
        this.props.updateCreator();
    }

    keyChange = (e) => {
        this.setState({
            roomKey: e.target.value.toUpperCase(),
        });
    };

    checkRoom = async (e) => {
        const { roomKey } = this.state;
        if ((e && e.key !== "Enter") || roomKey.trim() === "") { return; }
        
        const body = { roomKey, };
        const canJoin = await post("/api/check_room", body);
        if (canJoin) {
            this.props.setRoomKey(roomKey);
            this.props.changeView();
        }
        else {
            this.setState({roomKeyError: true})
        }
    };

    render() {
        return (<>
            <button
                onClick={this.createRoom}
                className="btn primary-btn long-btn"
            >
                Create a Room
            </button>
            { !this.state.wantToJoinRoom ?
                <button
                    onClick={() => this.setState({ wantToJoinRoom: true })}
                    className="btn primary-btn long-btn"
                >
                    Join a Room
                </button>
                :
                <div className="input-btn-wrapper room-key-field">
                    <input
                        className="input-btn-field room-key-input"
                        type="text"
                        value={this.state.roomKey}
                        maxLength={4}
                        placeholder="Enter room key"
                        onChange={(e) => this.keyChange(e)}
                        onKeyPress={(e) => this.checkRoom(e)}
                    />
                    <button 
                        onClick={() => this.checkRoom(null)} 
                        className={"btn primary-inverted-btn input-btn-submit"}
                    >
                        Enter
                    </button>
                    {
                        this.state.roomKeyError &&
                        <div className="warning">
                            The key you entered does not exist
                        </div>
                    }
                </div>
            }
        </>)
    }
}

const mapDispatchToProps = {
    setRoomKey,
}

export default connect(null, mapDispatchToProps)(RoomForm)
