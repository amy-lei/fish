import { 
    ENTER_GAME,
    UPDATE_INDEX,
 } from '../actions/types';

const initialState = {
    name: '',
    index: 0,
    isCreator: false,
};

export default (state = initialState, action) => {
    switch (action.type) {
        case ENTER_GAME:
            console.log('aciton ', action.payload);
            return {
                name: action.payload.name,
                index: action.payload.index,
                isCreator: action.payload.isCreator,
            };
        case UPDATE_INDEX:
            return {
                ...state,
                index: action.payload.index,
            };
        default:
            return state;
    }
}