import { combineReducers } from 'redux';
import user from './updateUser';
import turnInfo from './updateTurn';
import hand from './updateHand';
import roomkey from './roomkey';
import scores from './updateScores.js';
import teams from './updateTeams';


export default combineReducers({
    roomkey,
    user,
    turnInfo,
    hand,
    teams,
    scores,
});