const SIZE = 4;
const SUITS = [
    'heart', 
    'diamond', 
    'spade', 
    'club',
  ];
const RANKS = [
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
];
  
const generateCards = (n) => {
    let cards = [];
    // generate the 52 normal cards
    for (let suit of SUITS) {
        for (let rank of RANKS) {
            cards.push({
                rank: rank,
                suit: suit,
            });
        }
    }

    // account for the two jokers
    cards.push({ rank: "joker", suit: "black"});
    cards.push({ rank: "joker", suit: "red"});

    let output = [];
    const numCards = SIZE / n;
    // cards.sort(() => Math.random() - 0.5);

    for(let i = 0; i < n; i++) {
        output.push(cards.slice(i * numCards, i * numCards + numCards));
    }
    
    return output;
}

module.exports = generateCards;
