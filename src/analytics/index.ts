import { ticker } from "../ticker";

const run = async () => {
  const data = ticker.getKline({ symbol: "BTCUSDT", interval: 1 });
  console.log(data[0]);
};

export const analytics = { run };
