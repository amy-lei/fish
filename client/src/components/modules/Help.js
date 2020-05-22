import React, { Component } from "react";
import { card_svgs } from '../card_svgs';
import { halfSuits } from '../card_objs';

const halfSuitsToNames = {
    high_spade: "High Spades",
    high_heart: "High Hearts",
    high_club: "High Clubs",
    high_diamond: "High Diamonds",
    low_spade: "Low Spades",
    low_heart: "Low Hearts",
    low_club: "Low Clubs",
    low_diamond: "Low Diamonds",
    special: "Joker & 8's",
};

class Help extends Component{

    render() {
        console.log(card_svgs);
        console.log(halfSuits);
        return (
            <div className='help'>
                <div className='help-content'>
                    <div>
                        <span className='help-title'>Instructions For Fish</span>
                        <span className='close-help' onClick={() => this.props.closeHelp()}>&times;</span>
                    </div>
                    <div className='help-instructions'>
                        <p>Welcome to Fish.</p>
                        <p>The goal of this game is for your team to collect and declare 5 half-suits.
                            Half-suits are separated into low half-suits and high half-suits.
                            Here are all of the half-suits and their corresponding names:</p>
                        {Object.keys(halfSuits).map((halfSuit, k) => {
                            return (
                                <div key={k}>
                                    {halfSuits[halfSuit].map((card, j) => {
                                        return (
                                            <img
                                                src={card_svgs[card.rank + "-" + card.suit + ".svg"]}
                                                className="help-card"
                                            />
                                        )
                                    })}
                                    {halfSuitsToNames[halfSuit]}
                                </div>
                            )
                        })}
                        <p>The game begins with one person as the asker. This person gets to ask any of the
                            people on the opposite team for a card. If the other person has that card, the
                            asker takes that card and gets to ask again. However, if the other person doesn't
                            have the card, then the other person becomes the asker.</p>
                        <p>There are some rules with asking:</p>
                        <ul>
                            <li>The asker cannot ask for a card that they already have.</li>
                            <li>The asker can only ask for a card that is in the same half-suit as the cards that the already asker has.</li>
                        </ul>
                        <p>This continues on until someone declares.</p>
                        <p>
                            When someone declares, everyone stops what they are doing and listens to the declarer. The
                            declarer will first pick a half-suit and declares which person on their teams have which cards
                            in that half-suit. If the declarer is correct, then they get the half-suit. However, if
                            they are wrong, then the other team will get the half-suit. Once a declaration is over, all
                            cards that belong in that half-suit are taken out of the game.
                        </p>
                    </div>
                </div>
            </div>
        )
    }
}

export default Help;