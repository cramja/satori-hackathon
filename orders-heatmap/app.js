/* global window,document */
import React, {Component} from 'react';
import {render} from 'react-dom';
import MapGL from 'react-map-gl';
import DeckGLOverlay from './deckgl-overlay.js';
import {csv as requestCsv} from 'd3-request';
// import SatoriSDK from 'satori-rtm-sdk';

var RTMClient = require("satori-sdk-js");
const config = {
  // appKey: "CDD8D4A5EccbEbC6DAeeD5F1Bdaa947D",
  // endpoint: "wss://inimb49z.api.satori.com",
  appKey: "2eDb1ed1Dfbc37a4bbcCeC4D7eDbBfb6",
  endpoint: "wss://riwvcu52.api.satori.com",
  channel: "order",
};


var client = new RTMClient(config.endpoint, config.appKey);
var channel = client.subscribe(config.channel, RTMClient.SubscriptionMode.SIMPLE, 
  { history: {age: 60*60*1 /* 2 hr */ }}); 
    // filter: 'SELECT * FROM `orders` WHERE orderId LIKE "fake%"'});

function randn_bm() {
  const i = 0.004;
  var u = 0, v = 0;
  while(u === 0) u = Math.random(); //Converting [0,1) to (0,1)
  while(v === 0) v = Math.random();
  return Math.sqrt( -2.0 * Math.log( u ) ) * Math.cos( 2.0 * Math.PI * v ) * i;
}
 
// Set your mapbox token here
// TODO: replace with static token :/
const MAPBOX_TOKEN = "pk.eyJ1IjoiYWhtYWxpODYiLCJhIjoiY2o3ZHljZnBsMGRoZDJ3cnN5NDlnaTNiYSJ9.rdYtpNhnrXeHW51NAcyxLw" //process.env.MapboxAccessToken; // eslint-disable-line

// Source data CSV
// const DATA_URL = 'https://raw.githubusercontent.com/uber-common/deck.gl-data/master/examples/3d-heatmap/heatmap-data.csv';  // eslint-disable-line

class Root extends Component {

  constructor(props) {
    super(props);
    this.state = {
      viewport: {
        ...DeckGLOverlay.defaultViewport,
        width: 500,
        height: 500
      },
      data: [],
      buffer: [],
      ended: false
    };

    var handleMessage = (pdu) => {
      var state = this.state;
      console.log("start handleMessage");
      // limit the total number of messages we read
      if (state.data.length > 10000) {
        if (!state.ended) {
          this.state.ended = true;
          console.log("ended collection");
        }
        return;
      }

      // add new data to a buffer
      var messages = pdu.body.messages;
      console.log("recieved " + messages.length + " messages");
      for (var i = 0; i < messages.length; i++) {
        var msg = messages[i];
        //state.buffer.push([Number(msg.destinationLatLong[1]), Number(msg.destinationLatLong[0])]);
        var lat = Number(msg.destinationLatLong[0]);
        var lon = Number(msg.destinationLatLong[1]);

        for (var j = 0; j < 100; j++) {
          state.buffer.push([lon + randn_bm(), lat + randn_bm()]);
        }
      }

      // feed the real data, and call set state
      if (state.buffer.length > 20) {
        state.data = state.data.concat(state.buffer);
        state.buffer = [];
        const data = state.data;
        this.setState({data});
      }
    };
    handleMessage.bind(this);

    channel.on("rtm/subscription/data", handleMessage);
    channel.on('enter-subscribed', function () {
      console.log('Subscribed to: ' + channel.subscriptionId);
    });

    var millisecondsToWait = 3000;
    setTimeout(function() {
        client.start();
    }, millisecondsToWait);

    
  }

  componentDidMount() {
    window.addEventListener('resize', this._resize.bind(this));
    this._resize();
  }

  _resize() {
    this._onViewportChange({
      width: window.innerWidth,
      height: window.innerHeight
    });
  }

  _onViewportChange(viewport) {
    this.setState({
      viewport: {...this.state.viewport, ...viewport}
    });
  }

  render() {
    const {viewport, data} = this.state;

    return (
      <MapGL
        {...viewport}
        mapStyle="mapbox://styles/mapbox/dark-v9"
        onViewportChange={this._onViewportChange.bind(this)}
        mapboxApiAccessToken={MAPBOX_TOKEN}>
        <DeckGLOverlay
          viewport={viewport}
          data={data || []}
        />
      </MapGL>
    );
  }
}

render(<Root />, document.body.appendChild(document.createElement('div')));
