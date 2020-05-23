import React, { Component } from 'react';
const Context = React.createContext({});


/*
  Store for game constants that only need to be initialized
  upon game creaton/lobby such as name, index, roomkey, isCreator  
*/
export class GlobalStore extends Component {
    state = {
        name: '',
        index: 0,
        roomkey: '',
        isCreator: false,
        players: [],
    };

    updateSelf = (name, index) => {
        this.setState({ name, index }, () => console.log(this.state));
        
    }

    setRoomKey = (roomkey) => {
        this.setState({ roomkey }, () => console.log(this.state));
    }

    toggleCreator = (isCreator) => {
        this.setState({ isCreator }, () => console.log(this.state));
    }

    render() {
        return (
        <Context.Provider
            value={{
                ...this.state,
                updateSelf: this.updateSelf,
                setRoomKey: this.setRoomKey,
                toggleCreator: this.toggleCreator,
            }}
        >
            {this.props.children}
        </Context.Provider>
        );
    }
}

export default Context;