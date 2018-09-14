import React from 'react';
import './ChatMessage.css';

const ChatMessage = ({user, message}) => {
    return (
        <div className={'chat-message ' + user}>
            <p>{message}</p>
        </div>
    )
}

export default ChatMessage;