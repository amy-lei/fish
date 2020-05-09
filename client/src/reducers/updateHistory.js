import { UPDATE_HISTORY } from '../actions/types';

const initialState = [];

export default (state=initialState, action) => {
    switch(action.type) {
        case UPDATE_HISTORY:
            return action.payload;
        default:
            return state;
    }
}