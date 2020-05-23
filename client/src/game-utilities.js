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
    Returns an object that separates the cards in the 
    given half suit from the rest

    @hand (array): list of cards
    @halfSuit (string): target halfsuit
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
    Returns the player can object to the declare or not.
    This means having the cards that the declarer claimed
    the user had or having cards that another player was
    assumed to have had. 

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
    Returns the proper naming of the card
    Normal cards will be (rank) of (suit)
    Jokers will be (suit) (rank)
    
    @card (object): card to be named
*/
export const nameOfCard = (card) => {
    if (card.rank in rankToVal) {
        return card.rank + ' of ' + card.suit;
    } else {
        return card.suit + ' ' + card.rank;
    }
}

/*
  Returns an object mapping to list of players on user's team
  and list of players on the other team

  @players (array): list of all players
  @index (int): index of current user 
*/
export const splitPlayers = (players, index) => {
    let otherTeam = [];
    let yourTeam = [];
    const parity = index % 2;
    players.forEach((player) => {
        if (player.index % 2 === parity) {
            yourTeam.push(player);
        } else {
            otherTeam.push(player);
        }
    });

    return { yourTeam, otherTeam };
}