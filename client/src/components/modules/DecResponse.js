import React, { Component } from "react";
import { post } from "../../utilities";
import { canObject } from "../../game-utilities";
import { socket } from "../../client-socket";
import "../styles/declare.scss";


class DecResponse extends Component {
    constructor(props){
        super(props);
        this.state = {
            lie: false,
            votes: [],
            voted: false,
        };
    }
    /*
        STEP 1 of declaring: 

        Submit your response to the declare
        and alert others. 
        If OBJECT, validate the objection first
     */
    resToDeclare = async (bool) => {
        const body = {
            key: this.props.roomkey,
            player: this.props.name, 
            agree: bool,
        };
        if (bool) await post("/api/vote", body);
        else {
            // validate objections first
            if (canObject(this.props.hand, this.props.guess, this.props.name)){
                await post("/api/vote", body);
                this.setState({lie: false});
            } 
            else this.setState({lie:true}); 
        }
    }
    /*
        STEP 2 of declaring:

        Once everyone has voted, check for any objections
        (which results in other team gaining the point). 
        Announce results.

     */
    endDeclare = async () => {
        // check for objections
        const objections = !this.state.votes.every(vote => vote.agree);
        const even = this.props.index % 2 === 0; // your team
        const body = {
            even: objections ? !even : even,
            key: this.props.roomkey, 
            declare: this.props.guess
        };
        // reset declaring states
        this.setState({
            lie: false,
            voted: false,
            votes: [],
        });
        await post("/api/score", body);
    }

    componentDidMount() {
        // update when someone submits their res to declare
        socket.on("vote", vote => {
            if (vote.name === this.props.name) this.setState({voted: true});
            this.setState({votes: this.state.votes.concat(vote)});
        });

    }

    render() {
        const declaration = (
            <div className="declare-name">
                {this.props.declarer} declared!
            </div>);

        let guess;
        if (this.props.guess.length === 0) {
            guess = <p className="declare-guess_wait">
            {`${this.props.declarer} is making their guess. Communication disabled in the meantime.`}
            </p>
        } else {
            guess = this.props.guess.map(combo => (
                <div className="declare-guess">
                    {combo.player} has the {combo.rank} {combo.suit}
                </div>
            ));
        }
        
        const votes = this.state.votes.map(vote => 
            <div className="declare-votes">{vote.name} {vote.agree ? "agees": "OBJECTED"}</div>)

        let finish;
            if (this.props.isDeclarer && this.state.votes.length === this.props.minVotes) {
                finish = (<button className="btn primary-btn" onClick={this.endDeclare}>Finish</button>);
            }
    
        return (
            <div className="sidebar declare">
                {declaration}
                <div className="declare-guesses">
                    {guess}
                </div>
                {!this.props.isDeclarer && this.props.guess.length !== 0 && !this.state.voted && 
                (<div className="declare-vote_instruction">
                    Press OBJECT if you see a contradiction. ACCEPT otherwise.
                    <div className="declare-vote_btns">
                        <button className="btn accept-btn"onClick={()=> this.resToDeclare(true)}>
                            Accept
                        </button>
                        <button className="btn object-btn"onClick={() => this.resToDeclare(false)}>
                            Object
                        </button>
                    </div>
                    <span className="warning">{this.state.lie && "Dont lie!!!!"}</span>
                </div>
                )}
                <div className="declare-votes-container">
                    {votes}
                </div>
                {finish}
            </div>
        )
    }
}

export default DecResponse;