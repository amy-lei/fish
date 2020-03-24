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
  
export const hasCard = (hand, target) => {
    for(let card of hand) 
        if (card.rank === target.rank && card.suit === target.suit) return true;
    
    return false;        
}

export const isValidAsk = (hand, target) => {
    for (let card of hand) 
        if (sameHalfSuit(target, card)) return true;
    return false;
}

export const isValidDeclare = (declare) => {
    
    for (let guess of declare) {
        // make sure nothing is empty 
        if (guess.player && guess.rank && guess.suit) {
            // compare to first card 
            if (!sameHalfSuit(declare[0], guess)) return false;
        } else return false;
    }
    return true;
}

const sameHalfSuit = (base, card) => {
    if (base.rank === "joker" || rankToVal[base.rank] == 8)
        return card.rank === "joker" || rankToVal[card.rank] === 8;
    else {
        const upper = rankToVal[base.rank] > 8;
        return rankToVal[card.rank] > 8 === upper && card.suit === base.suit
    }
}