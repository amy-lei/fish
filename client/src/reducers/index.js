import { combineReducers } from 'redux';
import user from './updateUser';
import turnInfo from './updateTurn';
import hand from './updateHand';
import roomkey from './roomkey';
import scores from './updateScores';
import teams from './updateTeams';
import history from './updateHistory';
import players from './updatePlayers';

export default combineReducers({
    roomkey,
    user,
    turnInfo,
    hand,
    teams,
    scores,
    history,
    players,
});