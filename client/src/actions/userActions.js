import { SUBMIT_NAME, SET_INDEX, ENTER_GAME } from './types';

export const submitName = (name) => (dispatch) => {
    dispatch({
        type: SUBMIT_NAME,
        payload: name,
    });
};

export const setIndex = (index) => (dispatch) => {
    dispatch({
        type: SET_INDEX,
        payload: index,
    });
}

export const joinGame = (name, index, isCreator) => (dispatch) => {
    dispatch({
        type: ENTER_GAME,
        payload: { name, index, isCreator },
    });
}