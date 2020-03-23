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
    if (target.rank === "joker" || rankToVal[target.rank] == 8)
        for(let card of hand)
            {
                console.log('checking',card);
                if (card.rank === "joker" || rankToVal[card.rank] === 8) return true;
            }
    else {
        const upper = rankToVal[target.rank] > 8;
        for (let card of hand) 
            if (rankToVal[card.rank] > 8 === upper && card.suit === target.suit) return true;
    }
    return false;
}