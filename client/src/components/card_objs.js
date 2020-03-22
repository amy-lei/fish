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
  
const generateCards = () => {
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

    return cards;
}

export const cards = generateCards();