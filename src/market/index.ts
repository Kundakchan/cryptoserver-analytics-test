import chalk from "chalk";
import { client } from "../client";
import { InstrumentInfo } from "./interface";

const instrumentsInfo: InstrumentInfo = {};

const fetchCoins = async () => {
  try {
    console.log(chalk.blue("Получения списка монет..."));
    const { result } = await client.getInstrumentsInfo({
      category: "linear",
      status: "Trading",
    });

    result.list.forEach((coin) => {
      if (coin.quoteCoin === "USDT") {
        instrumentsInfo[coin.symbol] = coin;
      }
    });
    console.log(chalk.green("Монеты успешно получены!"));
    return instrumentsInfo;
  } catch (error) {
    throw new Error(`Ошибка получения списка монет: ${error}`);
  }
};

const getAllSymbol = () => Object.keys(instrumentsInfo);

export const market = { fetchCoins, getAllSymbol };
