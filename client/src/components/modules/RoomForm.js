import React, { Component } from "react";
import { post } from "../../utilities";
import GlobalContext from '../../context/GlobalContext';

class RoomForm extends Component {
    
    static contextType = GlobalContext;

    constructor(props) {
        super(props);
        this.state = {
            roomkey: "",
            wantToJoinRoom: false,
            roomKeyError: false,
        };
    }

    createRoom = () => {
        this.props.changeView();
        this.context.toggleCreator(true);
    }

    keyChange = (e) => {
        this.setState({
            roomkey: e.target.value.toUpperCase(),
        });
    };

    checkRoom = async (e) => {
        const { roomkey } = this.state;
        if ((e && e.key !== "Enter") || roomkey.trim() === "") { return; }
        
        const body = { roomkey };
        const canJoin = await post("/api/check_room", body);
        if (canJoin) {
            this.props.changeView();
            this.context.setRoomKey(roomkey);
            this.context.toggleCreator(false);
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
                        value={this.state.roomkey}
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

export default RoomForm;
