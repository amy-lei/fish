import { SET_ROOM } from '../actions/types';

const initialState = '';

export default (state = initialState, action) => {
    switch (action.type) {
        case SET_ROOM:
            return action.payload;
        default:
            return state;
    }
}