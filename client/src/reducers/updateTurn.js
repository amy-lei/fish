import { 
    UPDATE_TURN,
 } from '../actions/types';

const initialState = {
    whoseTurn: '',
    turnType: 'ASK',
}

export default (state = initialState, action) => {
    switch (action.type) {
        case UPDATE_TURN:
            return {
                ...state,
                whoseTurn: action.payload.player,
                turnType: action.payload.turnType,
            }
        default:
            return state;
    }
};