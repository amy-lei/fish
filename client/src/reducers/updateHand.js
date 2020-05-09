import {
    REMOVE_CARD,
    ADD_CARD,
    REMOVE_HALF_SUIT,
} from '../actions/types';
import { post } from '../utilities';
import { removeHalfSuit } from '../game-utilities';
const initialState = [];

export default (state = initialState, action) => {
    let hand;
    switch (action.type) {
        case ADD_CARD:
            return state.concat({
                rank: action.payload.rank,
                suit: action.payload.suit,
            })
        case REMOVE_CARD:
            hand = state.filter(card => 
                !(card.rank === action.payload.rank 
                    && card.suit === action.payload.suit)
                );
            break;
        case REMOVE_HALF_SUIT:
            hand = removeHalfSuit(state, action.payload.declare);
            break;
        default:
            return state;
    }

    // broadcast if user is out
    if (hand.length === 0) {
        const body = {
            key: action.payload.roomkey,
            index: action.payload.index,
        }
        console.log('out!');
        post('/api/out', body);
    }
    
    return hand;

}