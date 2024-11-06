import { market } from "./market";
import { ticker } from "./ticker";

const SETTINGS = {} as const;

const app = async () => {
  await market.fetchCoins();
  ticker.watch();
  // orderbook.watch();
  // analytics.run()
};

app();
