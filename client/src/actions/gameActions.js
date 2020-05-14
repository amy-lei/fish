import { 
    SET_ROOM,
    UPDATE_TURN,
    REMOVE_CARD,
    ADD_CARD,
    REMOVE_HALF_SUIT,
    INIT_HAND,
    PLAYER_OUT,
    SET_TEAMS,
    UPDATE_SCORE,
    UPDATE_HISTORY,
    SET_PLAYERS,
} from './types';

export const setRoomKey = (key) => (dispatch) => {
    dispatch({
        type: SET_ROOM,
        payload: key,
    });
}

export const updateTurn = (player, turnType) => (dispatch) => {
    dispatch({
        type: UPDATE_TURN,
        payload: { player, turnType },
    });
}

export const removeCard = (roomkey, index, card) => (dispatch) => {
    dispatch({
        type: REMOVE_CARD,
        payload: { roomkey, index, card },
    });
}

export const addCard = (card) => (dispatch) => {
    dispatch({
        type: ADD_CARD,
        payload: card,
    });
}

export const removeSuit = (roomkey, index, halfSuit) => (dispatch) => {
    dispatch({
        type: REMOVE_HALF_SUIT,
        payload: { roomkey, index, halfSuit },
    });
}

export const setHand = (hand) => (dispatch) => {
    dispatch({
        type: INIT_HAND,
        payload: hand,
    });
}

export const setPlayers = (players) => (dispatch) => {
    dispatch({
        type: SET_PLAYERS,
        payload: players,
    });
}

export const setTeams = (yourTeam, otherTeam) => (dispatch) => {
    dispatch({
        type: SET_TEAMS,
        payload: { yourTeam, otherTeam },
    });
}

export const playerOut = (index) => (dispatch) => {
    dispatch({
        type: PLAYER_OUT,
        payload: index,
    });
} 

export const declareResults = (yourTeam, otherTeam) => (dispatch) => {
    dispatch({
        type: UPDATE_SCORE,
        payload: { yourTeam, otherTeam },
    });
}

export const updateHistory = (history) => (dispatch) => {
    dispatch({
        type: UPDATE_HISTORY,
        payload: history,
    });
}