import {
    REMOVE_CARD,
    ADD_CARD,
    REMOVE_HALF_SUIT,
    INIT_HAND,
} from '../actions/types';
import { post } from '../utilities';
import { removeHalfSuit } from '../game-utilities';
const initialState = [];

export default (state = initialState, action) => {
    let hand;
    switch (action.type) {
        case INIT_HAND:
            console.log('given',action.payload);
            return action.payload;
        case ADD_CARD:
            hand = [...state, {
                rank: action.payload.rank,
                suit: action.payload.suit,
            }];
            return hand

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
        post('/api/out', body);
    }
    return hand;

}