import { SUBMIT_NAME, SET_INDEX } from './types';

export const submitName = (name) => (dispatch) => {
    dispatch({
        type: SUBMIT_NAME,
        payload: name,
    });
};

export const setIndex = (index) => (dispatch) => {
    console.log('setting index to', index);
    dispatch({
        type: SET_INDEX,
        payload: index,
    });
}