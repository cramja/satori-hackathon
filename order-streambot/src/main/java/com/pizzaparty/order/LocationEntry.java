package com.pizzaparty.order;

public class LocationEntry {

    private String orderId;
    private boolean isStart;
    private boolean isEnd;
    private boolean isExpress;
    private Double[] curLatLong;
    private long orderTimeStamp;
    private long currentTimeStamp;

    public boolean isExpress() {
        return isExpress;
    }

    public void setExpress(boolean express) {
        isExpress = express;
    }

    private Double[] startLatLong;

    public String getOrderId() {
        return orderId;
    }

    public void setOrderId(String orderId) {
        this.orderId = orderId;
    }

    public boolean isStart() {
        return isStart;
    }

    public void setStart(boolean start) {
        isStart = start;
    }

    public boolean isEnd() {
        return isEnd;
    }

    public void setEnd(boolean end) {
        isEnd = end;
    }

    public Double[] getCurLatLong() {
        return curLatLong;
    }

    public void setCurLatLong(Double[] curLatLong) {
        this.curLatLong = curLatLong;
    }

    public long getOrderTimeStamp() {
        return orderTimeStamp;
    }

    public void setOrderTimeStamp(long orderTimeStamp) {
        this.orderTimeStamp = orderTimeStamp;
    }

    public long getCurrentTimeStamp() {
        return currentTimeStamp;
    }

    public void setCurrentTimeStamp(long currentTimeStamp) {
        this.currentTimeStamp = currentTimeStamp;
    }

    public Double[] getStartLatLong() {
        return startLatLong;
    }

    public void setStartLatLong(Double[] startLatLong) {
        this.startLatLong = startLatLong;
    }

    public Double[] getEndLatLong() {
        return endLatLong;
    }

    public void setEndLatLong(Double[] endLatLong) {
        this.endLatLong = endLatLong;
    }

    private Double[] endLatLong;

    public LocationEntry(){

    }

    public LocationEntry(String orderId, boolean isStart, boolean isEnd, boolean isExpress, Double[] curLatLong, long orderTimeStamp, long currentTimeStamp, Double[] startLatLong, Double[] endLatLong) {
        this.orderId = orderId;
        this.isStart = isStart;
        this.isEnd = isEnd;
        this.curLatLong = curLatLong;
        this.orderTimeStamp = orderTimeStamp;
        this.currentTimeStamp = currentTimeStamp;
        this.startLatLong = startLatLong;
        this.endLatLong = endLatLong;
    }
}
