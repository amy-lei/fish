import { 
    SET_ROOM,
    UPDATE_TURN,
    REMOVE_CARD,
    ADD_CARD,
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

export const removeCard = (roomkey, index, rank, suit) => (dispatch) => {
    dispatch({
        type: REMOVE_CARD,
        payload: { roomkey, index, rank, suit },
    });
}

export const addCard = (rank, suit) => (dispatch) => {
    dispatch({
        type: ADD_CARD,
        payload: { rank, suit },
    });
}

export const removeSuit = (roomkey, index, declare) => (dispatch) => {
    dispatch({
        type: REMOVE_HALF_SUIT,
        payload: { roomkey, index, declare },
    })
}
