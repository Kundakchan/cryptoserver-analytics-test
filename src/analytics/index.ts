import { ticker } from "../ticker";
import { SETTINGS } from "..";
import { orderbook } from "../orderbook";
import { calculateMedian } from "../utils";
import { WebSocketService } from "../webSocketService";

const webSocketService = new WebSocketService(8080);

const run = async () => {
  // const data = ticker.getKline({
  //   symbol: "BTCUSDT",
  //   interval: 5,
  //   type: "lastPrice",
  // });

  analyzeOrderBook();
};

const analyzeOrderBook = () => {
  const down: number[] = [];
  const up: number[] = [];
  orderbook.getAnalyzeDataBySymbol(SETTINGS.symbol).forEach((item) => {
    if (item.direction === "down") {
      down.push(item.priceChange);
    } else if (item.direction === "up") {
      up.push(item.priceChange);
    }
  });

  if (
    down.length > up.length &&
    calculateMedian(down) >= 2 * calculateMedian(up)
  ) {
    console.log("Sell");
    webSocketService.broadcastData([
      { symbol: SETTINGS.symbol, side: "Sell", value: calculateMedian(down) },
    ]);
  } else if (
    up.length > down.length &&
    calculateMedian(up) >= 2 * calculateMedian(down)
  ) {
    console.log("Buy");
    webSocketService.broadcastData([
      { symbol: SETTINGS.symbol, side: "Buy", value: calculateMedian(up) },
    ]);
  }
  console.log({ down: calculateMedian(down), up: calculateMedian(up) });
};

export const analytics = { run };
