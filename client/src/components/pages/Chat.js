import React, { Component } from "react";


import { get, post } from "../../utilities";
import { socket } from "../../client-socket.js";

import "../../utilities.css";
import "./Chat.css";

class Chat extends Component {
  constructor(props) {
    super(props);
    this.state = {
      allMessages: [],
      curMessage: "",
    };
  }

  componentDidMount() {
    this.loadMessages();
    socket.on("newMessage", (message) => {
      this.setState({
        allMessages: this.state.allMessages.concat(message),
      });
    });
    socket.on("joinedWaitingRoom", (newPlayer) => {
      const joinedMessage = {
        sender_name: "server",
        content: newPlayer.name + " has joined the room.",
      };
      this.setState({
        allMessages: this.state.allMessages.concat(joinedMessage),
      });
    })
  }

  loadMessages = async () => {
    const query = {
      room_key: this.props.room_key,
    };
    const messages = await get('/api/chat', query);
    console.log(messages);
    this.setState({ allMessages: messages });
  };

  sendMessage = async () => {
    const trimmedMessage = this.state.curMessage.trim();
    if (trimmedMessage === "") {
      return;
    }
    const body = { 
      sender_name : this.props.name,
      content: trimmedMessage,
      room_key: this.props.room_key,
    };
    const message = await post('/api/chat', body);
    console.log(message);
    this.setState({
      curMessage: "",
    });
  };

  handleOnChange = (e) => {
    this.setState({
      curMessage: e.target.value,
    });
  };

  render() {
    let messages;
    if (this.state.allMessages) {
      messages = this.state.allMessages.map( (mes) => {
        if (mes.sender_name === "server") {
          return (
            <div className="server_message">
              {mes.content}
            </div>
          )
        }
        return (
          <div className="message">
            {mes.sender_name} : {mes.content}
          </div>
        );
      });
    }

    return (
      <>
        <h1>Chat</h1>
        {messages}
        <input 
          type="text"
          value={this.state.curMessage}
          onChange={this.handleOnChange}
        />
        <button onClick={this.sendMessage}>
          Send
        </button>
      </>
    );
  }
}

export default Chat;
