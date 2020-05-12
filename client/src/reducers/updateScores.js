import {
    UPDATE_SCORE,
} from '../actions/types';

const initialState = {
    yourTeam: 0,
    otherTeam: 0,
};

export default (state=initialState, action) => {
    switch (action.type) {
        case UPDATE_SCORE:
            return {
                yourTeam: action.payload.yourTeam,
                otherTeam: action.payload.otherTeam,
            };
        default:
            return state;
    }
}