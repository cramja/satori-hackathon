package com.pizzaparty.order;


public class OrderEntry {

    private String orderId;
    private boolean isExpress;
    private float cost;
    private String sourceAddress;
    private Double[] sourceLatLong;
    private String destinationAddress;
    private Double[] destinationLatLong;
    private long orderTimeStamp;

    public String getOrderId() {
        return orderId;
    }

    public void setOrderId(String orderId) {
        this.orderId = orderId;
    }

    public boolean isExpress() {
        return isExpress;
    }

    public void setExpress(boolean express) {
        isExpress = express;
    }

    public float getCost() {
        return cost;
    }

    public void setCost(float cost) {
        this.cost = cost;
    }

    public String getSourceAddress() {
        return sourceAddress;
    }

    public void setSourceAddress(String sourceAddress) {
        this.sourceAddress = sourceAddress;
    }

    public Double[] getSourceLatLong() {
        return sourceLatLong;
    }

    public void setSourceLatLong(Double[] sourceLatLong) {
        this.sourceLatLong = sourceLatLong;
    }

    public String getDestinationAddress() {
        return destinationAddress;
    }

    public void setDestinationAddress(String destinationAddress) {
        this.destinationAddress = destinationAddress;
    }

    public Double[] getDestinationLatLong() {
        return destinationLatLong;
    }

    public void setDestinationLatLong(Double[] destinationLatLong) {
        this.destinationLatLong = destinationLatLong;
    }

    public long getOrderTimeStamp() {
        return orderTimeStamp;
    }

    public void setOrderTimeStamp(long orderTimeStamp) {
        this.orderTimeStamp = orderTimeStamp;
    }

    public OrderEntry(String orderId, boolean isExpress, float cost, String sourceAddress, Double[] sourceLatLong, String destinationAddress, Double[] destinationLatLong, long orderTimeStamp) {
        this.orderId = orderId;
        this.isExpress = isExpress;
        this.cost = cost;
        this.sourceAddress = sourceAddress;
        this.sourceLatLong = sourceLatLong;
        this.destinationAddress = destinationAddress;
        this.destinationLatLong = destinationLatLong;
        this.orderTimeStamp = orderTimeStamp;
    }


    public OrderEntry() {

    }

}
