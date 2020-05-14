export const rankToVal = {
    'ace': 14,
    'two': 2,
    'three': 3,
    'four': 4,
    'five': 5,
    'six': 6,
    'seven': 7,
    'eight': 8,
    'nine': 9,
    'ten': 10,
    'jack': 11,
    'queen': 12,
    'king': 13,
};
  
/* 
    Returns whether a card is in the list of cards

    @hand (array):  list of cards
    @target (object): card to check for
 */
export const hasCard = (hand, target) => {
    for(let card of hand) 
        if (card.rank === target.rank && card.suit === target.suit) 
            return {
                card,
                have: true,
            };
    return {
        card: null,
        have: false,
    };        
}

/*
*/
export const separateHalfSuit = (hand, halfSuit) => {
    const ownCards = new Set();
    for(let c of hand) {
        const {card, have} = hasCard(halfSuit, c);
        if (have) {
            ownCards.add(card);
        }
    }
    
    return {
        ownCards,
        availableCards: halfSuit.filter(card => !ownCards.has(card)),
    };
}

/*
    Returns whether the declare was correct in 
    the perspective of the specified player

    @hand (array): player's list of cards
    @declare (array): list of guesses
    @name (string): player's name
 */
export const canObject = (hand, declare, name) => {
    for (let [player, guess] of Object.entries(declare)) {
        for (let card of guess) {
            let {have} = hasCard(hand, card);
            let you = player === name;
            if (have && !you) return true;
            if (you && !have) return true;
        }
    }
    return false;
}


/*
    Returns the hand with all of specified 
    half suit removed 

    @hand (array): list of cards
    @declare (array): list of guesses 
 */
export const removeHalfSuit = (hand, halfSuit) => {
    return hand.filter(card => 
                card.halfSuit !== halfSuit
        );
}

export const nameOfCard = (card) => {
    if (card.rank in rankToVal) {
        return card.rank + ' of ' + card.suit;
    } else {
        return card.suit + ' ' + card.rank;
    }
}

export const SUITS = [
    'heart', 
    'diamond', 
    'spade', 
    'club',
  ];
export const JOKER_SUITS = [
    'red',
    'black',
];
export const RANKS = [
    'ace',
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
    'joker',
];