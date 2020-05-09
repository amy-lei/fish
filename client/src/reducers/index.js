import { combineReducers } from 'redux';
import updateUser from './updateUser';
import updateTurn from './updateTurn';
import updateHand from './updateHand';
import roomkey from './roomkey';
import updateScores from './updateScores.js';
import updateTeams from './updateTeams';


export default combineReducers({
    roomkey,
    user: updateUser,
    turnInfo: updateTurn,
    hand: updateHand,
    teams: updateTeams,
    scores: updateScores,
});