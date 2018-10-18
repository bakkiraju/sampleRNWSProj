'use strict';

import React, { Component } from 'react';
import {
  StyleSheet,
  View,
  Image
} from 'react-native';

const parseString = require('react-native-xml2js').parseString;
const timer = require('react-native-timer');

function urlForQueryAndPage(key, value, pageNumber) {

  const querystring = key + '=' + value;

  return 'http://192.168.111.10:9980/run?' + querystring;
}

function strip(s) {
  return s.split('').filter(function (x) {
    var n = x.charCodeAt(0);

    return 31 < n && 127 > n;
  }).join('');
}

function stripStr(s) {
  return strip(s);
}

export default class testRunner extends Component {
  static navigationOptions = {
    title: 'WS Custom HeartBeat Sample'
  };

  constructor(props) {
    super(props);
    this.inputRefs = {};
    this.state = {
      open: false,
      heartbeatState: "dub"
    };

    console.log("Inital connection attempt to ws server");
    this.hbsocket = new WebSocket('ws://192.168.111.10:9980/');
  }


  _setupWebSocketHandlers() {
    this.hbsocket.onopen = (e) => {
      this.hbsocket.send(JSON.stringify({ command: 'greet', payload: 'Hello server!' }));
      this._startHearBeat();
      console.log("Connection to jungu opened");
    };
    this.hbsocket.onclose = (e) => { this.hbsocket = null; this._stopHeartBeat(); console.log("web socket closed ::",e.reason, "::",e.code) };
    this.hbsocket.onerror = (e) => { this.hbsocket = null; console.log(e.message); };
    this.hbsocket.onmessage = ({ data }) => {
      console.log("raw data:", stripStr(data));
      var payload = JSON.parse(stripStr(data));
      console.log("parsed data:", payload);
      if (this.state.heartbeatState == "lub")
        this.setState({ heartbeatState: "dub" });
      else
        this.setState({ heartbeatState: "lub" });
    };
  }

  componentWillUnmount() {
    this.hbsocket.close(0, "shutting down app");
    this.hbsocket = null;
    this._stopHeartBeat();
  }

  componentDidMount() {
    this._reconnectOnClose();
    this._setupWebSocketHandlers();
  }

  _establishConnection() {
    console.log("trying to establish new connection with jungu server");
    this.hbsocket = new WebSocket('ws://192.168.111.10:9980/');
    this._setupWebSocketHandlers();
  }

  _reconnectOnClose() {
    console.log("starting reconnection timer");
    timer.setInterval('reconnect_timer', () => {
      if (this.hbsocket != null &&  this.hbsocket.readyState) {
         console.log("Already connected");
         return;
      } else if (this.hbsocket != null &&  (this.hbsocket.CLOSING || this.hbsocket.CONNECTING)) {
        console.log("trying to stabilize");
        return;
      } else if (this.hbsocket != null && this.hbsocket.OPEN) {
        console.log("Connection already open");
        return;
      } else {
        this._establishConnection();
      }
    }, 3000);
  }

  _startHearBeat() {
    console.log("heartbeat timer started");
    timer.setInterval('heartbeat_timer', () => {
      if (!this.hbsocket) { console.log("hb fail: null  socket"); return; }
      if (this.hbsocket.readyState !== 1) { console.log("hb fail : socket not ready"); return; }
      this.hbsocket.send(JSON.stringify({ command: "heartbeat", payload: this.state.heartbeatState }));
    }, 1000);
  }

  _stopHeartBeat() {
    console.log("heartbeat timer cleared");
    timer.clearInterval('heartbeat_timer');
  }

  displayHeartBeatStatus() {
    if (this.state.heartbeatState == "lub") {
      console.log("Returning red heart");
      return (<Image style={styles.heartBeatImage} source={require('./Resources/icons8-heart-outline.png')} />);
    } else {
      console.log("Returning heart outline");
      return (<Image style={styles.heartBeatImage} source={require('./Resources/icons8-heart-red.png')} />);
    }
  }

  render() {
    return (
      <View style={styles.container}>      
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {this.displayHeartBeatStatus()}
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  spinner: {
    marginTop: 150
  },
  description: {
    marginTop: 20,
    marginBottom: 20,
    fontSize: 18,
    color: '#656565',
  },
  container: {
    flex: 1,
    padding: 30,
    backgroundColor: '#FEFEFE',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  heartBeatImage: {
    width: 75,
    height: 75,
  },
});