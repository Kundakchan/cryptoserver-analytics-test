import { LinearInverseInstrumentInfoV5 } from "bybit-api";

export interface InstrumentInfo
  extends Partial<Record<string, LinearInverseInstrumentInfoV5>> {}
