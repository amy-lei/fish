import {
    TOGGLE_ASK,
    TOGGLE_RESPONSE,
    TOGGLE_DECLARE,
} from '../actions/types';

const initialState = {
    asking: false,
    responding: false,
    declaring: false,
    declarer: '',
};

export default (state=initialState, action) => {
    switch(action.type) {
        case TOGGLE_ASK:
            return {
                ...state,
                asking: !state.asking,
            }
        case TOGGLE_RESPONSE:
            return {
                ...state,
                responding: !state.repsonding,
            }
        case TOGGLE_DECLARE:
            return {
                ...state,
                declaring: !state.responding,
                declarer: !state.responding ? action.payload : '',
            }
        default:
            return state;
            
    }
}