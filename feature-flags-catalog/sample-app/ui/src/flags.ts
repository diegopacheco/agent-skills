import declared from "../flags.json";
import { type Logger, logger } from "./logger";

export type FeatureFlags = { isEnabled(name: string): boolean };

export function featureFlags(values: Readonly<Record<string, boolean>>, log: Logger): FeatureFlags {
  return {
    isEnabled(name: string): boolean {
      const value = values[name] ?? false;
      log.info("flag_evaluated", { flag: name, value });
      return value;
    },
  };
}

export const flags = featureFlags(declared, logger);
