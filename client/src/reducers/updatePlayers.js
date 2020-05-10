import { SET_PLAYERS } from '../actions/types';

const initialState = [];

export default (state=initialState, action) => {
    switch(action.type) {
        case SET_PLAYERS:
            console.log('players',action.payload);
            return action.payload;
        default:
            return state;
    }
}