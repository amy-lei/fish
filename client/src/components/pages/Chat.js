import React, { Component } from "react";

import { get, post } from "../../utilities";
import { socket } from "../../client-socket.js";

import "../styles/Chat.scss";
import "../styles/App.scss";

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
    });

    socket.on("disconnected", (name) => {
      const disconnectMessage = {
        sender_name: "server",
        content: name + " has left the room.",
      };
      this.setState({
        allMessages: this.state.allMessages.concat(disconnectMessage),
      });
    });

    socket.on("ready", (readyInfo) => {
      const readyMessage = {
        sender_name: "server",
        content: `${readyInfo.readyPlayer} is ${readyInfo.readyState ? "ready" : "not ready"}`,
      };
      this.setState({
        allMessages: this.state.allMessages.concat(readyMessage),
      });
    });
  }

  loadMessages = async () => {
    const query = {
      room_key: this.props.roomKey,
    };
    const messages = await get('/api/chat', query);
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
      room_key: this.props.roomKey,
    };
    const message = await post('/api/chat', body);
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
      messages = this.state.allMessages.map( (mes, k) => {
        if (mes.sender_name === "server") {
          return (
            <div className="server-message" key={k}>
              {mes.content}
            </div>
          )
        }
        return (
          <div className="message" key={k}>
            <div className={"sender"}>{mes.sender_name}</div>
            <div className={"content"}>{mes.content}</div>
          </div>
        );
      });
    }

    return (
      <div className="chat">
        <div className="message-container">
          {messages}
        </div>
        <div className="chat-input-wrapper">
          <input
            type="text"
            value={this.state.curMessage}
            onChange={this.handleOnChange}
            className="chat-input"
            placeholder="Send a message"
          />
          <button onClick={this.sendMessage} className="btn chat-submit">
            >
          </button>
        </div>
      </div>
    );
  }
}

export default Chat;
