import { SET_WINNER } from '../actions/types';

const initialState = '';

export default (state=initialState, action) => {
    switch(action.type) {
        case SET_WINNER:
            return action.payload;
        default:
            return state;
    }
}