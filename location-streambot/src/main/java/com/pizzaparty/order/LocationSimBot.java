package com.pizzaparty.order;

import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.satori.bots.framework.*;
import org.slf4j.Logger;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

public class LocationSimBot implements Bot {

    private static final Logger logger = BotContext.getLogger(LocationSimBot.class);
    private static final String OUTPUT_CHANNEL_LOCATION = "location";
    private static final String OUTPUT_CHANNEL_ORDER = "order";
    private static final int IN_FLIGHT_TARGET = 15;
    private Timer timer = new Timer();
    private List<OrderTransit> transits = new ArrayList<>();
    private Map<String, DestinationInfo> destinationMap = new ConcurrentHashMap<>();
    private Map<String, DestinationInfo> currentSimMap = new ConcurrentHashMap<>();
    private Map<String, OrderEntry> currentOrders = new ConcurrentHashMap<>();
    private Map<String, Integer> currentIndexMap = new ConcurrentHashMap<>();
    private static int REFRESH_SECONDS = 2;
    private BotContext ctx;
    private List<DestinationInfo> destinationInfos;

    @Override
    public void onSetup(BotContext botContext) {
        ctx = botContext;
        final JsonObject object = botContext.getCustomConfiguration().getAsJsonObject();
        destinationInfos = Helper.destinationInfoListFromJson(object.getAsJsonArray("locations").toString());
        for (DestinationInfo di : destinationInfos){
            destinationMap.put(di.getDestination(), di);
        }
        timer.schedule(new SimulatorTask(
                ctx,
                transits,
                IN_FLIGHT_TARGET,
                OUTPUT_CHANNEL_ORDER,
                OUTPUT_CHANNEL_LOCATION,
                destinationInfos,
                currentSimMap,
                currentOrders,
                currentIndexMap),
                REFRESH_SECONDS * 1000, REFRESH_SECONDS * 1000);
        logger.info("Setup done for location bot");
    }

    @Override
    public void onSubscriptionData(BotContext ctx, RtmSubscriptionData messages) {
        for (JsonElement msg : messages.getMessages()) {
            OrderEntry order = Helper.orderFromJson(msg.toString());
            currentSimMap.put(order.getOrderId(), destinationMap.get(order.getDestinationAddress()));
            currentIndexMap.put(order.getOrderId(), 0);
            currentOrders.put(order.getOrderId(), order);
        }
    }

    public static void main(String[] args) throws Exception {
        BotExecutor executor = new BotExecutor("config.json");
        executor.start(new LocationSimBot());
    }

}