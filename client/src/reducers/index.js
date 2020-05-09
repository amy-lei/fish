import { combineReducers } from 'redux';
import updateUser from './updateUser';
import updateTurn from './updateTurn';
import updateHand from './updateHand';
import roomkey from './roomkey';
import updateScores from './updateScores.js';
import { yourTeam, otherTeam } from './updateTeams';


export default combineReducers({
    key: roomkey,
    user: updateUser,
    turnInfo: updateTurn,
    hand: updateHand,
    yourTeam,
    otherTeam,
    scores: updateScores,
});