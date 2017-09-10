import React from 'react'
import ReactDOM from 'react-dom'
import mapboxgl from 'mapbox-gl'

mapboxgl.accessToken = 'pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4M29iazA2Z2gycXA4N2pmbDZmangifQ.-g_vE53SD2WrJ6tFX7QHmA';

const MarioCastleImg = './castle.png';
const PizzaSlowImg = './pizza_slow.png';
const PizzaFastImg = './pizza_fast.png';
const FlagImg = './flag.ico'

var locations = require("./location_payload.json")
locations = locations.locations;

const config = {
  appKey: "2eDb1ed1Dfbc37a4bbcCeC4D7eDbBfb6",
  endpoint: "wss://riwvcu52.api.satori.com",
  channel: "location",
};
var RTMClient = require("satori-sdk-js");

var client = new RTMClient(config.endpoint, config.appKey);
var channel;
var locationBuffer = [];
var recentState = {};


var publishOrder = function(dest_address, uuid, isExpress, cost) {
  // At this point, the client may not yet be connected to Satori RTM.
  // If client is not connected then skip publishing.
   var lengthPayloads = locations.length;

   var destLatLong = [];
   for (var i = 0; i++; i < lengthPayloads - 1){
     if(locations[i].destination === dest_address){
       destLatLong = locations[i].polyLine[locations[i].polyLine.length - 1];
     }
   }

   var client = new RTMClient(config.endpoint, config.appKey);
   client.on('enter-connected', function () {
   		var timeStamp = Math.floor(Date.now() / 1000);
		var order = {
		orderId : uuid,
		isExpress : isExpress,
		cost : cost,
		sourceAddress : "1355 Market St #900, San Francisco, CA 94103",
		sourcelatLong : [-122.416, 37.776],
		destinationAddress : dest_address, //set from drop-down
		destinationLatLong : destLatLong,
		orderTimeStamp : timeStamp
		};

		client.publish("order", order, function(pdu) {
		if (pdu.action.endsWith("/ok")) {
			// Publish is confirmed by Satori RTM.
			console.log("publish confirmed");
		}
    });
   });
   client.start();
}

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

export class PizzaMap extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      data: [],
      uuid: this.props.uuid
    };

    publishOrder("4228 22nd St, San Francisco, CA 94114", this.state.uuid, true, 5)

    channel = client.subscribe(
    	config.channel,
    	RTMClient.SubscriptionMode.SIMPLE,
		{"filter": "select * from `location` where `orderId` = '" + this.state.uuid + "'"});

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
  	return (
  		<div>
        <div className="inline-block absolute top left mt12 ml12 bg-darken75 color-white z1 py6 px12 round-full txt-s txt-bold">
        </div>
        <div ref={el => this.mapContainer = el} className="absolute top right left bottom" />
      </div>
     );
  }

}