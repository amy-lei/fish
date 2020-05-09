import { 
    SET_ROOM,
    UPDATE_TURN,
} from './types';

export const setRoomKey = (key) => (dispatch) => {
    dispatch({
        type: SET_ROOM,
        payload: key,
    });
}

export const updateTurn = (player, turnType) => dispatch => {
    console.log('updating turn', player, turnType);
    dispatch({
        type: UPDATE_TURN,
        payload: { player, turnType },
    });
}
