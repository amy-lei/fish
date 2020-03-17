import React, { Component } from "react";


import { get, post } from "../../utilities";
import { socket } from "../../client-socket.js";

import "../../utilities.css";
import "./Chat.css";

class Chat extends Component {
  constructor(props) {
    super(props);
    this.state = {
      name: "",
      allMessages: [],
      curMessage: "",
    };
  }

  componentDidMount() {
    const name = prompt("Enter your name");
    this.setState({ name: name });
    
    this.loadMessages();
    socket.on("newMessage", (message) => {
      this.setState({
        allMessages: this.state.allMessages.concat(message),
      });
    });

  }

  loadMessages = async () => {
    const messages = await get('/api/chat');
    console.log(messages);
    this.setState({ allMessages: messages });
  }

  sendMessage = async () => {
    const body = { 
      sender_name : this.state.name,
      content: this.state.curMessage,
    };
    const message = await post('/api/chat', body);
    console.log(message);
    this.setState({
      curMessage: "",
    });
  } 

  handleOnChange = (e) => {
    this.setState({
      curMessage: e.target.value,
    });
  }

  render() {
    let messages;
    if (this.state.allMessages) {
      messages = this.state.allMessages.map( (mes) => (
        <div className="message">
          {mes.sender_name} : {mes.content}
        </div>
      ));      
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
