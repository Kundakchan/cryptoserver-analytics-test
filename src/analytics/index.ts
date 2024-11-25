import { ticker } from "../ticker";

const run = async () => {
  const data = ticker.getKline({
    symbol: "BTCUSDT",
    interval: 1,
    type: "lastPrice",
  });
  console.log(data.length);
};

export const analytics = { run };
