import React, { Component } from 'react';
import './App.css';

import Clappr from 'clappr'
import initClapprDetachPlugin from 'clappr-detach-plugin'

class App extends Component {
  componentDidMount() {
    const player = new Clappr.Player({
      source: "http://clips.vorwaerts-gmbh.de/big_buck_bunny.mp4",
      plugins: {
        'core': [
          initClapprDetachPlugin(Clappr),
        ],
      },
      detachOptions: {
        dragEnabled: true,
        width: 500,
        position: {
          bottom: 20,
        },
      },
    });

    player.attachTo(this.videoRef)
    this.setState({
      player,
    })
  }

  handleAttach = () => {
    this.state.player.configure({
      isDetached: false,
    })
  }

  handleDetach = () => {
    this.state.player.configure({
      isDetached: true,
    })
  }

  render() {
    return (
      <div>
        <div ref={(r) => this.videoRef = r}></div>
        <button onClick={this.handleAttach}>attach</button>
        <button onClick={this.handleDetach}>detach</button>
      </div>
    );
  }
}

export default App;
