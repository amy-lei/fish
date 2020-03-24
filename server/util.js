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
  
const sameHalfSuit = (base, card) => {
    if (base.rank === "joker" || rankToVal[base.rank] == 8)
        return card.rank === "joker" || rankToVal[card.rank] === 8;
    else {
        const upper = rankToVal[base.rank] > 8;
        return rankToVal[card.rank] > 8 === upper && card.suit === base.suit
    }
} 

/*
    Returns the hand with all of specified 
    half suit removed 

    @hand (array): list of cards
    @declare (array): list of guesses 
 */
const removeHalfSuit = (hand, declare) => {
    const base = { rank: declare[0].rank, suit: declare[0].suit }
    return hand.filter(card => 
            !sameHalfSuit(card, base)
        );
}

module.exports = removeHalfSuit;
