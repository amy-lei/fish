import React, { Component } from 'react';
import { socket } from '../client-socket';
import { post } from '../utilities';
import { splitPlayers } from '../game-utilities';

const Context = React.createContext({});
const WIN = 5; // FIX WHEN LAUNCH!!!

/*
  Store for game constants that only need to be initialized
  upon game creaton/lobby such as name, index, roomkey, isCreator  
*/
export class GlobalStore extends Component {
    state = {
        name: '',
        index: 0,
        roomkey: '',
        isReady: false,
        isCreator: false,
        hand: [],
        players: [],
        turnType: 'ASK',
        whoseTurn: '',
        yourTeam: [],
        otherTeam: [],
        scores: { yourTeam: 0, otherTeam: 0 },
        history: [],
        winner: '',
    };

    /*
      Update game states upon joining a new game or entering an ongoing game 

      @roomInfo (object): contains game and self
    */
    enterRoom = (roomInfo) => {
        const { game, self } = roomInfo;
        const rem = this.state.index % 2;
        if (game.start) { 
            // if returning, set teams, scores, and history
            const { yourTeam, otherTeam } = splitPlayers(game.players, this.state.index);
            const yourScore = rem === 0 ? game.even : game.odd;
            const otherScore = rem === 0 ? game.odd : game.even;
            this.setState({ 
                yourTeam, 
                otherTeam,
                scores: { yourTeam: yourScore, otherTeam: otherScore, },
                history: game.history,
            });
        } else { 
            // otherwise, set players since teams are undecided 
            this.setState({
                players: game.players,
            });
        }
        // must set name, index, and turn no matter what
        this.setState({
            name: self.name,
            index: self.index,
            whoseTurn: game.whoseTurn,
            turnType: game.turnType,
        });
    }

    /*
      Updates game states when creating a room

      @game (object): game instance from database
      @name (string): name of creator
    */
    createRoom = (name, game) => {
        this.setState({
            name,
            index: 0,
            whoseTurn: name,
            turnType: 'ASK',
            roomkey: game.key,
            players: game.players,
            hand: [],
        });
    }
    /*
      Updates score based on perspective of the player and
      returns whether the game is over (boolean)

      @even (boolean): is the current player Team Even
      @evenScore (int): updated score of team even
      @oddScore (int): updated score of team odd
    */
    updateScore = (even, evenScore, oddScore) => {
        const yourTeam = even ? evenScore : oddScore;
        const otherTeam = even ? oddScore : evenScore;
        this.setState({
            scores: { yourTeam, otherTeam },
        });
        return evenScore === WIN || oddScore === WIN;
    }

    /*
      Updates player turn and turn type under the condition
      that the player is out of cards

      @player (object): player who ran out of cards
    */

    adjustTurn = (player) => {
        const {
            turnType,
            yourTeam,
            otherTeam,
            history,
        } = this.state;
        
        // find the team the player is in
        const mapIndexToPlayer = {};
        [otherTeam, yourTeam].forEach((team) => {
            team.forEach((player) => {
                mapIndexToPlayer[player.index] = player;
            })});

        // if it was an ask, move it to next teammate
        if (turnType === 'ASK') {
            let nextIndex = (player.index + 2) % 6;
            while (nextIndex !== player.index) {
                const nextPlayer = mapIndexToPlayer[nextIndex]
                if (nextPlayer && nextPlayer.active) {
                    this.setState({ 
                        whoseTurn: nextPlayer.name,
                        turnType: 'ASK',
                    });
                    return;
                } else {
                    nextIndex = (nextIndex + 2) % 6;
                }
            }
            return; // force other team to declare
        } else {
            // if it was respond, have prev asker ask again
            const prevTurn = history[history.length - 1];
            let askerIndex = prevTurn.asker.index;
            let nextPlayer = mapIndexToPlayer[askerIndex];
            if (nextPlayer && nextPlayer.active) {
                this.setState({ 
                    whoseTurn: nextPlayer.name,
                    turnType: 'ASK',
                });
                return;
            } else {
                nextIndex = (nextIndex + 2) % 6;
                while (nextIndex !== askerIndex) {
                    nextPlayer = mapIndexToPlayer[nextIndex]
                    if (nextPlayer && nextPlayer.active) {
                        this.setState({ 
                            whoseTurn: nextPlayer.name,
                            turnType: 'ASK',
                        });
                        return;
                    } else {
                        nextIndex = (nextIndex + 2) % 6;
                    }
                }
                return;
            }
        }
    }

    /*
      If hand is empty, it is your turn, and game is ongoing,
      send alert to others that you're out
    */
    announceOut = () => {
        const body = {
            key: this.state.roomkey,
            index: this.state.index,
        }
        post('/api/out', body);
    }

    componentDidMount() {
        /* =====================================
          Update states relevant to WaitingRoom 
        ====================================== */
        
        // update when player joined room
        socket.on('joinedWaitingRoom', (players) => {
            this.setState({ players });
        });

        // update when player leaves room
        socket.on('updatedPlayerList', (list) => {
            this.setState({ players: list });
            const self = list.find((player) => player.name === this.state.name);
            if (self) {
                this.setState({ index: self.index });
                
                if (self.index === 0) { // swap creators
                    this.setState({
                        isReady: true,
                        isCreator: true,
                        whoseTurn: this.state.name,
                        turnType: 'ASK',
                    });
                }
            }
        });

        // update hand and teams when game starts
        socket.on('startGame', (info) => {
            const { index } = this.state;
            const { yourTeam, otherTeam } = splitPlayers(info.players, index);
            this.setState({
                hand: info.cards[index],
                yourTeam, 
                otherTeam,
            });
        });

        // update players when someone changes ready state
        socket.on('ready', (update) => {
            this.setState({ players: update.playerList });
        });

        /* =====================================
          Update states relevant to WaitingRoom 
        ====================================== */

        // after an ask, update turn info and history
        socket.on('ask', (update) => {
            this.setState({
                history: update.history,
                whoseTurn: update.move.recipient,
                turnType: 'RESPOND',
            });
        });

        // after a response, update turn/history and hand if successful
        socket.on("respond", (game) => {
            const { yourTeam, otherTeam } = splitPlayers(game.players, this.state.index);
            this.setState({
                history: game.history,
                turnType: 'ASK',
                whoseTurn: game.whoseTurn,
                hand: game.hands[this.state.index],
                yourTeam,
                otherTeam,
            }, () => {
                if (this.state.hand.length === 0 
                    && this.state.whoseTurn === this.state.name
                    && this.state.winner === '') {
                        this.announceOut();
            }});
        });

        // update whose turn if original player out
        socket.on('playerOut', (who) => {
            this.adjustTurn(who);
        });

        // when declare ends, update hand, score, and players 
        socket.on('updateScore', (update) => {
            const { yourTeam, otherTeam } = splitPlayers(update.g.players, this.state.index);
            this.setState({
                yourTeam, 
                otherTeam,
                hand: update.g.hands[this.state.index],
            }, () => {
                if (this.state.hand.length === 0 
                    && this.state.whoseTurn === this.state.name
                    && this.state.winner === '') {
                        this.announceOut();
            }});

            const even = this.state.index % 2 === 0;
            const gameOver = this.updateScore(even, update.g.even, update.g.odd);
            if (gameOver) {
                this.setState({
                    winner: update.even ? 'even' : 'odd',
                });
            }
        });

    }

    render() {
        return (
        <Context.Provider
            value={{
                ...this.state,
                updateSelf: (name, index) => this.setState({ name, index }),
                setRoomKey: (roomkey) => this.setState({ roomkey }),
                toggleCreator: (isCreator) => this.setState({ isCreator, isReady: isCreator }),
                toggleReady: (isReady) => this.setState({ isReady }),
                setHand: (hand) => this.setState({ hand }),
                enterRoom: this.enterRoom,
                createRoom: this.createRoom,
            }}
        >
            {this.props.children}
        </Context.Provider>
        );
    }
}

export default Context;