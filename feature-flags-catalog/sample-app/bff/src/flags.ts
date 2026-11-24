import type { Logger } from "./logger.ts";

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
