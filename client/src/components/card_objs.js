const SUITS = [
    'heart', 
    'diamond', 
    'spade', 
    'club',
  ];

const RANKS = [
    'two',
    'three',
    'four',
    'five',
    'six',
    'seven',
    'eight',
    'nine',
    'ten',
    'jack',
    'queen',
    'king',
    'ace',
];

import { rankToVal } from '../game-utilities';
  
const generateHalfSuits = () => {
    let halfSuits = {};

    for (let suit of SUITS) {
        for (let rank of RANKS) {
            let halfSuit;
            if (rankToVal[rank] < 8) {
                halfSuit = 'low_' + suit;
            } else if (rankToVal[rank] > 8) {
                halfSuit = 'high_' + suit;
            } else {
                halfSuit = 'special';
            }
            halfSuit in halfSuits 
                ? halfSuits[halfSuit].push(rank + '-' + suit)
                : halfSuits[halfSuit] = [rank + '-' + suit]
        }
    }
    // account for the two jokers
    halfSuits['special'].push({ rank: "joker", suit: "black"});
    halfSuits['special'].push({ rank: "joker", suit: "red"});
    

    return halfSuits;
}
export const halfSuits = generateHalfSuits();