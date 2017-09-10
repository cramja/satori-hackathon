import React from 'react'
import ReactDOM from 'react-dom'
import mapboxgl from 'mapbox-gl'

mapboxgl.accessToken = 'pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4M29iazA2Z2gycXA4N2pmbDZmangifQ.-g_vE53SD2WrJ6tFX7QHmA';
// const MarioCastleImg = 'https://cdn.iconscout.com/public/images/icon/premium/png-512/mario-castle-character-video-game-3d6f8132ae4acad6-512x512.png';
// const PizzaSlowImg = 'https://lh5.googleusercontent.com/MVR5QSokdo5gpsXJ7s081ppvXuoaUb44hhFWw6bTIneOQViCojG6dOx4V3QxJ2sUWz3Wh7hHz-535wY=w3294-h1898';//'https://cdn.iconscout.com/public/images/icon/premium/png-512/mario-castle-character-video-game-3d6f8132ae4acad6-512x512.png';
// const PizzaFastImg = 'https://lh6.googleusercontent.com/q8Cxk-Xzix4gNcpyyLJ53FniJdDR7Jj27H-PWV6nWyGndphmsSB0eWlAvWZYmDJ-q0mSxcnS6a9t2P0=w2880-h1304';//'https://cdn.iconscout.com/public/images/icon/premium/png-512/mario-castle-character-video-game-3d6f8132ae4acad6-512x512.png';
  // const FlagImg = 'http://clipart-finder.com/data/mini/chequered_flag_icon.png';

const MarioCastleImg = './castle.png';
const PizzaSlowImg = './pizza_slow.png';
const PizzaFastImg = './pizza_fast.png';
const FlagImg = './flag.ico'

var RTMClient = require("satori-sdk-js");
const config = {
  // appKey: "CDD8D4A5EccbEbC6DAeeD5F1Bdaa947D",
  // endpoint: "wss://inimb49z.api.satori.com",
  appKey: "2eDb1ed1Dfbc37a4bbcCeC4D7eDbBfb6",
  endpoint: "wss://riwvcu52.api.satori.com",
  channel: "location",
};
var client = new RTMClient(config.endpoint, config.appKey);
var channel = client.subscribe(config.channel, RTMClient.SubscriptionMode.SIMPLE);

var locationBuffer = [];
var recentState = {};

// reads a section of the locationBuffer, updates recentState map
var updateState = function() {
  var len = locationBuffer.length;
  for (var i = 0; i < len; i++) {
    var message = locationBuffer[i];
    // recentState[message.orderId] = message;
    if (recentState[message.orderId] == null) {
      recentState[message.orderId] = message;
    } else if (message.isEnd) {
      delete recentState[message.orderId];
    } else if (recentState[message.orderId].currentTimeStamp  < message.currentTimeStamp) {
      recentState[message.orderId] = message;
    }
  }
  // clear the locationBuffer
  locationBuffer = locationBuffer.splice(len + 1)
}

// recentState => geoJson
var getFeatureList = function(state, choose_message, choose_coords) {
  if (choose_coords == null) {
    choose_coords = (msg) => {return message.curLatLong;}
  }

  var featureArray = [];
  for (var orderId in state) {
    if (state.hasOwnProperty(orderId)) {
        var message = state[orderId];
        if (choose_message(message)) {
          var coords = choose_coords(message);
          if (coords == null) {
            console.log("coords was null");
            continue;
          }
          featureArray.push({ "type": "Feature",
                              "geometry": {
                                  "type": "Point",
                                  "coordinates": [coords[1], coords[0]]
                              }});
        }   
    }
  }
  return featureArray;
}

var mapGlobal = null;

// TODO: remove after testing...
updateState();

class Application extends React.Component {

  constructor(props: Props) {
    super(props);
    this.state = {
      data: []
    };
  }

  componentDidMount() {
    console.log("componentDidMount");

    const map = new mapboxgl.Map({
      container: this.mapContainer,
      style: 'mapbox://styles/mapbox/dark-v9',
      center: [-122.416, 37.776],
      zoom: 12
    });
    mapGlobal = map;

    const { lng, lat, zoom } = this.state;
    var onTick = () => {
      updateState();
      var slow = map.getSource('pizzas_slow');
      if (slow != null) {
        slow.setData({"type": "FeatureCollection", "features": getFeatureList(recentState, (msg)=>{return !msg.isExpress;})});
      } else {
        console.log("slow pizza was null");
      }

      var fast = map.getSource('pizzas_fast');
      if (fast != null) {
        fast.setData({"type": "FeatureCollection", "features": getFeatureList(recentState, (msg)=>{return msg.isExpress;})});
      } else {
        console.log("fast pizza was null");
      }

      var flags = map.getSource('flags');
      if (flags != null) {
        flags.setData({"type": "FeatureCollection", "features": getFeatureList(recentState, (msg)=>{return true;}, (msg)=>{return msg.endLatLong;})});
      } else {
        console.log("flags was null");
      }

    };
    onTick.bind(map);

    map.on('load', function() {
      // hq image:
      map.loadImage(MarioCastleImg, function(error, image) {
          if (error) throw error;
          map.addImage("mario", image);
          map.addLayer({
              "id": "points",
              "type": "symbol",
              "source": {
                  "type": "geojson",
                  "data": {
                      "type": "FeatureCollection",
                      "features": [
                         {
                          "type": "Feature",
                          "geometry": {
                              "type": "Point",
                              "coordinates": [-122.416, 37.776]
                          }
                        }
                      ]
                  }
              },
              "layout": {
                  "icon-image": "mario",
                  "icon-size": 0.15
              }
          });
      });

      map.loadImage(PizzaSlowImg, function(error, image) {
          if (error) throw error;
          console.log("added pizza slow");
          map.addImage("pizza_slow", image);
          map.addLayer({
              "id": "pizzas_slow",
              "type": "symbol",
              "source": {
                  "type": "geojson",
                  "data": {
                      "type": "FeatureCollection",
                      "features": []
                  }
              },
              "layout": {
                  "icon-image": "pizza_slow",
                  "icon-size": 0.15
              }
          });
      });
    });

    map.loadImage(PizzaFastImg, function(error, image) {
        if (error) throw error;
        console.log("added pizza fast");
        map.addImage("pizza_fast", image);
        map.addLayer({
            "id": "pizzas_fast",
            "type": "symbol",
            "source": {
                "type": "geojson",
                "data": {
                    "type": "FeatureCollection",
                    "features": []
                }
            },
            "layout": {
                "icon-image": "pizza_fast",
                "icon-size": 0.15
            }
        });
    });
  
    map.loadImage(FlagImg, function(error, image) {
        if (error) throw error;
        map.addImage("flag", image);
        map.addLayer({
            "id": "flags",
            "type": "symbol",
            "source": {
                "type": "geojson",
                "data": {
                    "type": "FeatureCollection",
                    "features": []
                }
            },
            "layout": {
                "icon-image": "flag",
                "icon-size": 0.15
            }
        });
    });


    setInterval(onTick, 500);

    map.on('move', () => {
      const { lng, lat } = map.getCenter();
      this.setState({
        lng: lng.toFixed(4),
        lat: lat.toFixed(4),
        zoom: map.getZoom().toFixed(2)
      });
    });

    var handleMessage = (pdu) => {
      var state = this.state;
      // limit the total number of messages we read

      // add new data to a buffer
      var messages = pdu.body.messages;
      for (var i = 0; i < messages.length; i++) {
        var msg = messages[i];
        locationBuffer.push(msg);
      }
      // feed the real data, and call set state
    };
    handleMessage.bind(this);

    channel.on("rtm/subscription/data", handleMessage);
    channel.on('enter-subscribed', function () {
      console.log('Subscribed to: ' + channel.subscriptionId);
    });
    client.start();
  
  }

  render() {
    const { lng, lat, zoom } = this.state;

    return (
      <div>
        <div className="inline-block absolute top left mt12 ml12 bg-darken75 color-white z1 py6 px12 round-full txt-s txt-bold">
          <div>{`Longitude: ${lng} Latitude: ${lat} Zoom: ${zoom}`}</div>
        </div>
        <div ref={el => this.mapContainer = el} className="absolute top right left bottom" />
      </div>
    );
  }
}



ReactDOM.render(<Application />, document.getElementById('app'));
