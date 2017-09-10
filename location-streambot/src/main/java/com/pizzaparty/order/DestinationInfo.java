package com.pizzaparty.order;

import java.util.List;

public class DestinationInfo {

    private String source;
    private String destination;
    private List<Double[]> polyLine;

    public String getSource() {
        return source;
    }

    public void setSource(String source) {
        this.source = source;
    }

    public String getDestination() {
        return destination;
    }

    public void setDestination(String destination) {
        this.destination = destination;
    }

    public List<Double[]> getPolyLine() {
        return polyLine;
    }

    public void setPolyLine(List<Double[]> polyLine) {
        this.polyLine = polyLine;
    }

    public DestinationInfo(String source, String destination, List<Double[]> polyLine) {

        this.source = source;
        this.destination = destination;
        this.polyLine = polyLine;
    }

    public DestinationInfo(){

    }
}
