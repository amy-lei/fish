![Animals playing fish](./client/src/public/illustration.svg)
# Online Fish
Fish (but online) for those booted out of campus!

## Motivation
Due to COVID-19, my first year on campus was cut short. I remember feeling devastated along with my friends and desperate to somehow recreate the interactions that being on-campus together had offered. That was when I took the intiative to digitalize [Fish](https://en.wikipedia.org/wiki/Literature_(card_game)), the card game. Fish was a defining part of our experiences on campus. It was our go-to for taking "breaks" from problem sets. I hoped that by recreating the card game that we all loved, I would be able to keep my friends connected.

## How to play
Gather five other friends and have someone create a room. Using the server generated room key, have the remaining friends join using the key. Only when all players are ready can the room creator start the game.

As with in-person Fish, you can _ask_ the opposing team for a card, _respond_ to an ask, or _declare_ a half-suit. You may only _ask_ and _respond_ when it is your turn, but you can declare at any time. It is important to note that declaring "pauses" the game.

The enforced rules are nearly the same as the set of rules listed [here](https://en.wikipedia.org/wiki/Literature_(card_game)). What differs is that:
- Players can declare outside of their turn
- Incorrect declares go to the other team, regardless of ownership of the cards
- Play continues until one team reaches 5 half-suits

_Note_: If the player whose turn it is runs out of cards, the turn will go back to the _asker_ if it was their turn to respond, or it will go to a teammate still in the game. This is to mimic the rule of "passing the turn to the player on the left".

## Setting Up Locally

- `git clone` this repository
- Run `npm install`
- Open two tabs in terminal
- Run `npm start` to start the back end
- Run `npm run hotloader` to start the front end
- Go to `localhost:5000`

## Credits
Credits to [Jason Lin](https://github.com/JasonLin43212) for the initial contributions.
