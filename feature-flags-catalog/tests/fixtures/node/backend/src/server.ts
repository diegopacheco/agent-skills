import { init } from "@launchdarkly/node-server-sdk";
import { getInstance } from "@eppo/node-server-sdk";
import { DevCycleClient } from "@devcycle/nodejs-server-sdk";
import { OptimizelyUserContext } from "@optimizely/optimizely-sdk";

const ld = init("sdk-key");

export async function handle(dc: DevCycleClient, user: OptimizelyUserContext): Promise<boolean> {
  const a = await ld.variation("node-flag", { kind: "user", key: "u" }, false);
  const b = getInstance().getBooleanAssignment("ts-eppo", "subject", {}, false);
  const c = dc.variableValue({ user_id: "u" }, "ts-devcycle", false);
  const d = user.decide("ts-opt").enabled;
  const e = Bun.env.FEATURE_BUN_FAST === "true";
  return Boolean(a && b && c && d && e);
}
