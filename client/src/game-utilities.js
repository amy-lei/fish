const rankToVal = {
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
        if (card.rank === target.rank && card.suit === target.suit) return true;
    return false;        
}


/*
    Returns whether the player has a card in the halfsuit 

    @hand (array): list of cards
    @target (object): a card in the desired halfsuit
 */
export const isValidAsk = (hand, target) => {
    if (!hasCard(hand, target)) {
        for (let card of hand) 
            if (sameHalfSuit(target, card)) return true;
    }
    return false;
}


/*
    Returns whether the declare is filled completely,
    with cards in the same half suit.

    @declare (array): list of guesses(objects)
 */
export const isValidDeclare = (declare) => {
    let asked = [];
    for (let guess of declare) {
        // make sure nothing is empty 
        if (guess.player && guess.rank && guess.suit) {
            if (!sameHalfSuit(declare[0], guess) || hasCard(asked, guess)) return false;
            else asked.push(guess);
        } else return false;
    }
    return true;
}

/*
    Returns whether the declare was correct in 
    the perspective of the specified player

    @hand (array): player's list of cards
    @declare (array): list of guesses
    @name (string): player's name
 */
export const canObject = (hand, declare, name) => {
    for (let guess of declare) {
        let have = hasCard(hand, guess);
        let you = declare.player === name;
        if (have && !you) return true;
        if (you && !have) return true;
    }
    return false;
}


/*
    Returns the hand with all of specified 
    half suit removed 

    @hand (array): list of cards
    @declare (array): list of guesses 
 */
export const removeHalfSuit = (hand, declare) => {
    console.log(declare);
    const base = { rank: declare[0].rank, suit: declare[0].suit }
    return hand.filter(card => 
            !sameHalfSuit(card, base)
        );
}


/*
    Returns whether two cards are of the same half suit

    @base (object): card to be compared with
    @card (object): card that is being checked
 */ 
const sameHalfSuit = (base, card) => {
    if (base.rank === "joker" || rankToVal[base.rank] == 8)
        return card.rank === "joker" || rankToVal[card.rank] === 8;
    else {
        const upper = rankToVal[base.rank] > 8;
        return rankToVal[card.rank] > 8 === upper && card.suit === base.suit
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