import { 
    SUBMIT_NAME,
    SET_INDEX,
 } from '../actions/types';

const initialState = {
    name: '',
    index: null,
};

export default (state = initialState, action) => {
    switch (action.type) {
        case SUBMIT_NAME:
            return {
                ...state,
                name: action.payload,
            }
        case SET_INDEX:
            return {
                ...state,
                index: action.payload,
            }
        default:
            return state;
    }
}