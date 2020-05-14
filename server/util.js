/*
    Returns the hand with all of specified 
    half suit removed 

    @hand (array): list of cards
    @declare (array): list of guesses 
 */
const removeHalfSuit = (hand, halfSuit) => {
    return hand.filter(card => 
                card.halfSuit !== halfSuit
        );
}

module.exports = removeHalfSuit;
