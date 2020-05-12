import { 
    ENTER_GAME,
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
        default:
            return state;
    }
}