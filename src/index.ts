import { analytics } from "./analytics";
import { market } from "./market";
import { orderbook } from "./orderbook";
import { ticker } from "./ticker";

const SETTINGS = {} as const;

const app = async () => {
  await market.fetchCoins();
  ticker.watch();
  orderbook.watch();
  // setInterval(() => {
  //   analytics.run();
  // }, 5 * 1000);
};

app();
