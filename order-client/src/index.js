import React from 'react'
import ReactDOM from 'react-dom'
import Dropdown from 'react-drop-down'
import Button from 'simple-react-button'
import {PizzaMap} from './map.js'

const defaultOption = "Pizza";
const options = ["1355 Market St #900, San Francisco, CA 94103",
"4228 22nd St, San Francisco, CA 94114",
"2430 Jones St, San Francisco, CA 94133"];

function guid() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
    s4() + '-' + s4() + s4() + s4();
};
var uuid = guid();

// var locations = require("location_payload.json")

// function submitOrder(location, expressFlag, dollaz) {
//   // At this point, the client may not yet be connected to Satori RTM.
//   // If client is not connected then skip publishing.
//    var lengthPayloads = payloads.locations.length;

//    var destLatLong = [];
//    for (var i = 0; i++; i < lengthPayloads - 1){
//      if(payloads[i].destination === address){
//        destLatLong = payloads[i].polyLine[ayloads[i].polyLine.length - 1];
//      }
//    }

//    if (client.isConnected()) {
//      var timeStamp = Math.floor(Date.now() / 1000);
//      var order = {
//       orderId : uuid, //UUID
//       isExpress : expressFlag,
//       sourceAddress : "1355 Market St #900, San Francisco, CA 94103",
//       sourcelatLong : [-122.416, 37.776],
//       destinationAddress : address, //set from drop-down
//       destinationLatLong : destLatLong,
//       orderTimeStamp : timeStamp
//     };


//     client.publish(OrderChannelName, order, function(pdu) {
//       if (pdu.action.endsWith("/ok")) {
//         // Publish is confirmed by Satori RTM.
//       }
//     });

//   }
// }

class Application extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      page: "init",
      data: [],
      address: null
    };

     this.handleDropdown.bind(this);
  }

  handleDropdown(e){
    console.log("handleDropdown");
    console.log(e);
    this.setState({page: "order", "order-type" : e})
  }

  handleOrder(){
    console.log("handleOrder");
    // submitOrder();
    this.setState({page: "map"});
  }

  handleOrderExpress(){
    console.log("handleOrder");
    // submitOrder();
    this.setState({page: "map"});
  }

  handleMap(){
    console.log("handleMap");
    this.setState({page: "order"})
  }

  render() {
    if(this.state.page === "init"){
      return(
        <div>
         <Dropdown value={defaultOption}
                  onChange={this.handleDropdown.bind(this)}
                  options={options} />
        </div>
      )
    }
    if(this.state.page === "order"){
      return (
        <div>
          <Button value='Express Delivery' clickHandler={this.handleOrder.bind(this)} />
          <Button value='Normal Delivery' clickHandler={this.handleOrderExpress.bind(this)} />
        </div>
      );

    }
    if (this.state.page === "map"){
      return (
      <div>
        <PizzaMap uuid={uuid}></PizzaMap>
      </div>
      );
    }
  }
}



ReactDOM.render(<Application />, document.getElementById('app'));
