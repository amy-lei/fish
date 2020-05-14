import { 
    ENTER_GAME,
    UPDATE_INDEX,
    CHANGE_CREATOR,
 } from '../actions/types';

const initialState = {
    name: '',
    index: null,
    isCreator: false,
};

export default (state = initialState, action) => {
    switch (action.type) {
        case ENTER_GAME:
            return {
                name: action.payload.name,
                index: action.payload.index,
                isCreator: action.payload.isCreator,
            };
        case UPDATE_INDEX:
            return {
                ...state,
                index: action.payload,
            };
        case CHANGE_CREATOR:
            return {
                ...state,
                isCreator: true,
            }
        default:
            return state;
    }
}