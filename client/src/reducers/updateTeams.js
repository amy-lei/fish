import { 
    PLAYER_OUT,
    SET_TEAMS,
 } from '../actions/types';

const initialState = {
    yourTeam: [],
    otherTeam: [],
}

const filterPlayers = (players, index) => {
    return players.map((player) => {
        if (player.index === index) {
            return {
                ...player,
                active: false,
            }
        } else {
            return player
        }
    });
}

export default (state = initialState, action) => {
    switch(action.type) {
        case PLAYER_OUT:
            console.log('player out!', action.payload);
            return {
                yourTeam: filterPlayers(state.yourTeam, action.payload),
                otherTeam: filterPlayers(state.otherTeam, action.payload),
            }
            
        case SET_TEAMS:
            return { 
                yourTeam: action.payload.yourTeam,
                otherTeam: action.payload.otherTeam,
            };
        default:
            return state;
    }
}