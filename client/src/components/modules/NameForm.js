import React, { Component } from "react";
import { post } from "../../utilities";
import { connect } from 'react-redux';
import { joinGame } from '../../actions/userActions';
import { socket } from "../../client-socket";
import { 
    setRoomKey,
    updateTurn,
    updateHistory,
    declareResults,
    setTeams,
    setPlayers,
} from '../../actions/gameActions';


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

    submitName = (e) => {
        const { clickedButton, name } = this.state;

        if (clickedButton || name.trim() === "") {
            return;
        }
        if (!e || e.key === "Enter") {
            this.setState({clickedButton: true}, 
                () => {
                    this.props.isCreator 
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
        this.props.joinGame(name, 0, true);
        this.props.setRoomKey(game.key);
        this.props.updateTurn(name, 'ASK');
        this.props.setPlayers(game.players);
        this.props.redirect('lobby');

    };

    enterRoom = async (name) => {
        const trimmedName = name.trim();
        if (trimmedName === "") {
          return;
        }
        const body = {
            playerName: name,
            room_key: this.props.roomkey,
            socketid: socket.id,
        };
        const roomInfo = await post('/api/join_room', body);
        const game = roomInfo.game;
        const self = roomInfo.self;
        if (roomInfo.return) {
            const otherTeam = [];
            const yourTeam = [];
            let yourScore;
            let otherScore;
            const parity = info.self.index % 2;
            game.players.forEach((player) => {
                if (player.index % 2 === parity) yourTeam.push(player);
                else otherTeam.push(player);
            });
            if (parity) {
                yourScore = game.even;
                otherScore = game.odd;
            } else {
                yourScore = game.odd;
                otherScore = game.even;
            }
            this.props.setTeams(yourTeam, otherTeam);
            this.props.declareResults(yourScore, otherScore);
            this.props.updateHistory(game.history);
            this.props.redirect('play');
        } else {
            this.setState({
                page: "waiting_room",
                isCreator: false,
                info: game,
            });
            this.props.setPlayers(game.players);
            this.props.redirect('lobby');
        }
        this.props.updateTurn(game.whoseTurn, game.turnType);
        this.props.joinGame(self.name, self.index, false);
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

const mapStateToProps = (state) => ({
    roomkey: state.roomkey,
});

const mapDispatchToProps = {
    setRoomKey,
    updateTurn,
    updateHistory,
    declareResults,
    setPlayers,
    setTeams,
    joinGame,
}

export default connect(mapStateToProps, mapDispatchToProps)(NameForm);