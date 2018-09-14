import React, { Component } from 'react';
import ChatMessage from '../components/ChatMessage';
import './ChatBox.css';

class ChatBox extends Component {
    constructor(props) {
        super(props)
        this.state = {
            history: [
                {
                    user: 'bot',
                    message: "I'm hungry"
                },
                {
                    user: 'bot',
                    message: "Let's go get something to eat."
                },
                {
                    user: 'user',
                    message: 'Okay, what do you want?'
                },
                {
                    user: 'bot',
                    message: "I don't know, you choose."
                }
            ],
            message: '',
            typing: false
        }

        this.handleChange = this.handleChange.bind(this);
        this.sendMessage = this.sendMessage.bind(this);
    }

    componentDidMount() {
        this.connection = new WebSocket('ws://localhost:3001');

        this.connection.onmessage = e => {
            const data = JSON.parse(e.data);
            if (data.state === 'SENT') {
                this.setState({
                    typing: false
                });
                this.addMessage('bot', data.answer);
            } else {
                this.setState({
                    typing: true
                });
                this.scrollToBottom();
            }
        }
    }

    scrollToBottom() {
        this.refs.chatbox.scrollTop = this.refs.chatbox.scrollHeight;
    }

    // handle change in input
    handleChange(e) {
        this.setState({ message: e.target.value });
    }

    // add message to history
    addMessage(user, message) {
        this.setState(prevState => ({
            history: [...prevState.history, { user: user, message: message }]
        }));
        this.scrollToBottom();
    }

    // add message to history and send message to web socket server
    sendMessage(e) {
        this.addMessage('user', this.state.message);
        this.connection.send(this.state.message);
        this.setState({
            message: ''
        });
        e.preventDefault();
    }

    render() {
        return (
            <form className='chat-container' onSubmit={this.sendMessage}>
                <div className='chat-box-container'  ref='chatbox'>
                    <div className='chat-box'>
                        {this.state.history.map((message, i) =>
                            <ChatMessage user={message.user} message={message.message} key={i}/>
                        )}
                        {this.state.typing ? <ChatMessage user='bot' message='Typing...'/> : ''}
                    </div>
                </div>
                <div className='chat-buttons'>
                    <input type='text' onChange={this.handleChange} value={this.state.message} placeholder='Type a message...'/>
                    <button type='submit'>Send</button>
                </div>
            </form>
        )
    }
}

export default ChatBox;