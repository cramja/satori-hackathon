package com.pizzaparty.order;

import com.satori.bots.framework.Ack;
import com.satori.bots.framework.BotContext;
import com.satori.bots.framework.RtmException;
import org.slf4j.Logger;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.TimerTask;

class SimulatorTask extends TimerTask {

    private final Map<String, Integer> currentIndexMap;
    private Map<String, DestinationInfo> currentSimMap;
    private Map<String, OrderEntry> currentOrders;
    private Logger logger = BotContext.getLogger(SimulatorTask.class);

    private BotContext ctx;
    private List<OrderTransit> transits;
    private int inFlightTarget;
    private String outputChannelOrder;
    private String outputChannelLocation;
    private List<DestinationInfo> destInfoList;

    public SimulatorTask(BotContext ctx,
                         List<OrderTransit> transits,
                         int inFlightTarget,
                         String outputChannelOrder,
                         String outputChannelLocation,
                         List<DestinationInfo> destInfoList,
                         Map<String, DestinationInfo> currentSimMap,
                         Map<String, OrderEntry> currentOrders,
                         Map<String, Integer> currentIndexMap){
        this.ctx = ctx;
        this.transits = transits;
        this.inFlightTarget = inFlightTarget;
        this.outputChannelOrder  = outputChannelOrder;
        this.outputChannelLocation = outputChannelLocation;
        this.destInfoList = destInfoList;
        this.currentSimMap = currentSimMap;
        this.currentOrders = currentOrders;
        this.currentIndexMap = currentIndexMap;

    }

    @Override
    public void run() {

        List<String> toRemove = new ArrayList<>();

        for(String s : currentSimMap.keySet()){

            DestinationInfo dt = currentSimMap.get(s);
            int currentIndex = currentIndexMap.get(s);

            boolean isStart = false;
            boolean isEnd = false;
            boolean isExpress = currentOrders.get(s).isExpress();

            Double[] curlatLong = dt.getPolyLine().get(currentIndex);
            Double[] startLatLong = dt.getPolyLine().get(0);
            Double[] endLatLong = dt.getPolyLine().get(dt.getPolyLine().size() - 1);

            long orderTimeStamp = currentOrders.get(s).getOrderTimeStamp();

            if(currentIndex == 0){
                isStart = true;

            } else if(dt.getPolyLine().size() - 1 == currentIndex){
                isEnd = true;
                toRemove.add(s);
            }

            LocationEntry locationEntry = new LocationEntry(
                    s,
                    isStart,
                    isEnd,
                    isExpress,
                    curlatLong,
                    orderTimeStamp,
                    System.currentTimeMillis(),
                    startLatLong,
                    endLatLong
            );

            try {
                String msg = Helper.locationToJson(locationEntry);
                ctx.getRtmProxy().publish(outputChannelLocation, locationEntry, Ack.YES);
                logger.info("Published location message: '{}'", msg);
            } catch (InterruptedException e) {
                logger.error("Execution interrupted", e);
                Thread.currentThread().interrupt();
            } catch (RtmException e) {
                logger.error("RTM problem: ", e);
            }

            ++currentIndex;

            currentIndexMap.put(s, currentIndex);
        }

        for(String s : toRemove){
            currentSimMap.remove(s);
            currentOrders.remove(s);
            currentIndexMap.remove(s);
        }

        if(currentSimMap.keySet().size() < inFlightTarget){
            for(int i = 1; i < inFlightTarget - transits.size(); ++ i){
                try {
                    OrderEntry randomOrder = Helper.getRandomOrder(destInfoList);
                    String msg = Helper.orderToJson(randomOrder);
                    ctx.getRtmProxy().publish(outputChannelOrder, randomOrder, Ack.YES);
                    logger.info("Published order message: '{}'", msg);
                } catch (InterruptedException e) {
                    logger.error("Execution interrupted", e);
                    Thread.currentThread().interrupt();
                } catch (RtmException e) {
                    logger.error("RTM problem: ", e);
                }
            }
        }
    }
}


