import { 
    ENTER_GAME,
    UPDATE_INDEX,
} from './types';

export const joinGame = (name, index, isCreator) => (dispatch) => {
    dispatch({
        type: ENTER_GAME,
        payload: { name, index, isCreator },
    });
}

export const updateIndex = (index) => (dispatch) => {
    dispatch({
        type: UPDATE_INDEX,
        payload: index,
    });
}