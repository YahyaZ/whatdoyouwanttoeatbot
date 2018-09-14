import React, { Component } from 'react';
import './App.css';
import ChatBox from './container/ChatBox';
import Header from './components/Header';

class App extends Component {
  render() {
    return (
      <div>
        <Header/>
        <ChatBox/>
      </div>
    );
  }
}

export default App;
