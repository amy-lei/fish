import React, { Component } from "react";
import { connect } from 'react-redux';

const PARITY_TO_TEAM = { "even": "BLUE", "odd": "RED" };

class GameStats extends Component {
    constructor(props){
        super(props);
        this.state = {};
    }

    generatePlayer = (teamParity) => {
        const yourParity = this.props.index % 2 === 0 ? 'even' : 'odd';
        
        let team;
        if (teamParity === yourParity) {
            team = this.props.yourTeam;
        } else {
            team = this.props.otherTeam;
        }
        return team.map(player => {
            const parity = player.index % 2 === 0 ? 'even' : 'odd';
            return(
            <div className={`stats_player team-${parity} ${player.active ? "" : "out"}`}>
                {player.name} {player.active ? "": " (OUT)"}
            </div>
        )});
    }

    render() {
        const userParity = this.props.index % 2 === 0 ? 'even' : 'odd';
        return (
        <div className="stats">
            <div className="stats_team-name">
                {Object.keys(PARITY_TO_TEAM).map(parity => (
                    <span> 
                        TEAM {PARITY_TO_TEAM[parity]} 
                        {userParity === parity 
                            ? `(YOU): ${this.props.scores.yourTeam}`
                            : `: ${this.props.scores.otherTeam}`}
                    </span>                
                ))}
            </div>
            <div className="stats_players">
                {Object.keys(PARITY_TO_TEAM).map(parity => this.generatePlayer(parity))}
            </div>
        </div>
        
        )
    }
}

const mapStatesToProps = (state) => ({
    index: state.user.index,
    yourTeam: state.teams.yourTeam,
    otherTeam: state.teams.otherTeam,
    scores: state.scores,
});

const mapDispatchToProps = {};

export default connect(mapStatesToProps, mapDispatchToProps)(GameStats);