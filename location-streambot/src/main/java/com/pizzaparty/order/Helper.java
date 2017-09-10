package com.pizzaparty.order;

import com.google.common.reflect.TypeToken;
import com.google.gson.Gson;
import com.satori.bots.framework.BotContext;
import org.slf4j.Logger;

import java.lang.reflect.Type;
import java.util.*;

public class Helper {

    private static final Logger logger = BotContext.getLogger(Helper.class);

    private static final int DESTINATION_LIST_RANDOM_THRESHOLD = 20;

    private static final Random random = new Random();

    private static Gson gson = new Gson();

    public static String orderToJson(OrderEntry order) {
        return gson.toJson(order);
    }

    public static OrderEntry orderFromJson(String json) {
        return gson.fromJson(json, OrderEntry.class);
    }

    public static String locationToJson(LocationEntry location) {
        return gson.toJson(location);
    }

    public static List<DestinationInfo> destinationInfoListFromJson(String json) {
        Type listType = new TypeToken<ArrayList<DestinationInfo>>() {}.getType();
        return gson.fromJson(json, listType);
    }

    public static OrderEntry getRandomOrder(List<DestinationInfo> dtInfoList) {

        float cost = Helper.randFloat(random, 9.0f, 12.0f);
        boolean isExpress = random.nextBoolean();
        if (isExpress) {
            cost = cost + Helper.randFloat(random, 1.0f, 3.0f);
        }

        DestinationInfo dt = dtInfoList.get(random.nextInt(DESTINATION_LIST_RANDOM_THRESHOLD - 1));

        return new OrderEntry(
                UUID.randomUUID().toString(),
                isExpress,
                cost,
                dt.getSource(),
                dt.getPolyLine().get(0),
                dt.getDestination(),
                dt.getPolyLine().get(dt.getPolyLine().size() - 1),
                System.currentTimeMillis()
        );
    }

    private static float randFloat(Random rand, float min, float max) {
        float result = rand.nextFloat() * (max - min) + min;
        return result;
    }


}
