package com.pizzaparty.order;

import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.satori.bots.framework.*;
import org.slf4j.Logger;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class OrderBot implements Bot {

  private static final Logger logger = BotContext.getLogger(OrderBot.class);

  private static final String OUTPUT_CHANNEL_LOCATION = "location_transaction";
  private Map<String, DestinationInfo> dentinationMap = new HashMap<>();
  private List<DestinationInfo> destinationInfos;

  @Override
  public void onSetup(BotContext botContext) {

    final JsonObject object = botContext.getCustomConfiguration().getAsJsonObject();
    destinationInfos = Helper.destinationInfoListFromJson(object.getAsJsonArray("locations").toString());
    for (DestinationInfo di : destinationInfos){
      dentinationMap.put(di.getDestination(), di);
    }
    logger.info("Setup done for order bot");
  }

  @Override
  public void onSubscriptionData(BotContext ctx, RtmSubscriptionData messages) {
    for (JsonElement msg : messages.getMessages()) {
      try {
        logger.info("Published message: '{}'", msg);
        ctx.getRtmProxy().publish(OUTPUT_CHANNEL_LOCATION, msg, Ack.YES);
      } catch (InterruptedException e) {
        logger.error("Execution interrupted", e);
        Thread.currentThread().interrupt();
      } catch (RtmException e) {
        logger.error("RTM problem: ", e);
      }
    }
  }

  public static void main(String[] args) throws Exception {
    BotExecutor executor = new BotExecutor("config.json");
    executor.start(new OrderBot());
  }

}
