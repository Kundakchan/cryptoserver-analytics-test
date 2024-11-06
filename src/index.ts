import { market } from "./market";

const SETTINGS = {} as const;

const app = async () => {
  await market.fetchCoins();
  // ticker.watch();
  // orderbook.watch();
  // analytics.run()
};

app();
