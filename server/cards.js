// const SIZE = 20;
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

const generateCards = (n) => {
    let cards = [];
    // generate the 52 normal cards
    for (let suit of SUITS) {
        for (let rank of RANKS) {
            let halfSuit;
            if (rankToVal[rank] < 8)      { halfSuit = 'low_' + suit; }
            else if (rankToVal[rank] > 8) { halfSuit = 'high_' + suit; }
            else                          { halfSuit = 'special'; }

            cards.push({
                rank,
                suit,
                halfSuit,
            });
        }
    }

    // account for the two jokers
    cards.push({ rank: "joker", suit: "black", halfSuit: 'special'});
    cards.push({ rank: "joker", suit: "red", halfSuit: 'special'});

    let output = [];
    const numCards = SIZE / n;
    cards.sort(() => Math.random() - 0.5);

    for(let i = 0; i < n; i++) {
        output.push(cards.slice(i * numCards, i * numCards + numCards));
    }
    
    return output;
}

module.exports = generateCards;
