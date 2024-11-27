import { analytics } from "./analytics";
import { market } from "./market";
import { orderbook } from "./orderbook";
import { ticker } from "./ticker";

export const SETTINGS = {
  symbol: "OGUSDT",
} as const;

const app = async () => {
  await market.fetchCoins();
  ticker.watch();
  orderbook.watch();
  setInterval(() => {
    analytics.run();
  }, 1 * 1000);
};

app();
