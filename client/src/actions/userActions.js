import { ENTER_GAME } from './types';

export const joinGame = (name, index, isCreator) => (dispatch) => {
    dispatch({
        type: ENTER_GAME,
        payload: { name, index, isCreator },
    });
}