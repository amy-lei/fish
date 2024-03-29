import React, { Component } from "react";

import { get, post } from "../../utilities";
import { socket } from "../../client-socket.js";
import { FACES } from '../../game_constants';

class Chat extends Component {
  constructor(props) {
    super(props);
    this.state = {
      allMessages: [],
      curMessage: "",
    };
    this.bottom_ref = React.createRef();
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
        content: newPlayer[newPlayer.length - 1].name + " has joined the room.",
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

    socket.on("ask", update => {
      const turnUpdate = {
        sender_name: "server",
        content: `It is ${update.move.recipient}'s turn to respond`,
      };
      this.setState({
        allMessages: this.state.allMessages.concat(turnUpdate),
      });
    });

    // update turn and hand if successful
    socket.on("respond", game => {
        const turnUpdate = {
          sender_name: "server",
          content: `It is ${game.whoseTurn}'s turn to ask.`,
        };
        this.setState({
          allMessages: this.state.allMessages.concat(turnUpdate),
        });
      }
    );
  }

  componentDidUpdate () {
    this.scrollToBottom();
  }

  scrollToBottom = () => {
    this.bottom_ref.current.scrollIntoView({behavior: "smooth"});
  };

  loadMessages = async () => {
    const query = {
      room_key: this.props.roomkey,
    };
    const messages = await get('/api/chat', query);
    this.setState({ allMessages: messages });
  };

  sendMessage = async (e) => {
    const trimmedMessage = this.state.curMessage.trim();
    if ((e && e.key !== "Enter") || trimmedMessage === "") {
      return;
    }
    const body = { 
      sender_index: this.props.index,
      sender_name : this.props.name,
      content: trimmedMessage,
      room_key: this.props.roomkey,
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
            <div className={`message_img ${
                mes.sender_index % 2 == 0? 'team-even' : 'team-odd'}`}>
              {FACES[mes.sender_index]} 
            </div>
            <div className="message_info">
              <div className="message_info-sender">{mes.sender_name}:&nbsp;</div> 
              <div className="message_info-content">{mes.content}</div>
            </div>
          </div>
        );
      });
    }

    return (
      <div className={`chat ${this.props.hidden && "hidden"}`}>
        <div className="chat-messages messages">
          {messages}
          <div className="thing-at-bottom" ref={this.bottom_ref}>
          </div>
        </div>
        <div className="chat-functions">
          <input
            type="text"
            value={this.state.curMessage}
            onChange={this.handleOnChange}
            className="chat-functions_input"
            placeholder="Send a message"
            onKeyPress={(e) => this.sendMessage(e)}
          />
          <button 
            onClick={() => this.sendMessage(null)} 
            className="chat-functions_submit"
          >
            <div className="send-symbol"></div>
          </button>
        </div>
      </div>
    );
  }
}

export default Chat;
