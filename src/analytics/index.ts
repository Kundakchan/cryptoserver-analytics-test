import { ticker } from "../ticker";

const run = async () => {
  console.log(ticker.getKline({ symbol: "BTCUSDT", interval: 1 }));
};

export const analytics = { run };
