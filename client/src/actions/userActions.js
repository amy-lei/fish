import { 
    ENTER_GAME,
    UPDATE_INDEX,
    CHANGE_CREATOR,
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

export const changeCreator = () => (dispatch) => {
    dispatch({
        type: CHANGE_CREATOR,
    });
}