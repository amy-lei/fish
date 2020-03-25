import React, { Component } from "react";
import { post } from "../../utilities";
import { canObject } from "../../game-utilities";
import { socket } from "../../client-socket";


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
            key: this.props.roomKey,
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
            key: this.props.roomKey, 
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
            <div className="popup">
                {this.props.declarer} is declaring!!
            </div>);

        const guess = this.props.guess.map(combo => (
            <div>
                {combo.player} has the {combo.rank} {combo.suit}
            </div>
        ));
        
        const votes = this.state.votes.map(vote => 
            <div>{vote.name} {vote.agree ? "agees": "OBJECTED"}</div>)

        console.log("cur votes",this.state.votes.length)
        console.log("min votes",this.props.minVotes)
        console.log("truth",this.state.votes.length === this.props.minVotes)
        console.log("is declarer",this.props.declarer)
        console.log("is declarer",this.props.isDeclarer)
        console.log("hence",this.props.isDeclarer && this.state.votes.length === this.props.minVotes)
        let finish;
            if (this.props.isDeclarer && this.state.votes.length === this.props.minVotes) {
                finish = (<button onClick={this.endDeclare}>Finish</button>);
            }
    
        return (
            <div className="popup">
                {declaration}
                {guess}
                {!this.props.isDeclarer && this.props.guess.length !== 0 && !this.state.voted && 
                (<>
                    Press OBJECT if you see a contradiction. ACCEPT otherwise.
                    <button onClick={()=> this.resToDeclare(true)}>
                        Accept
                    </button>
                    <button onClick={() => this.resToDeclare(false)}>
                        Object
                    </button>
                    {this.state.lie && "Dont lie!!!!"}
                </>)
                }
                {votes}
                {finish}
            </div>
        )
    }
}

export default DecResponse;