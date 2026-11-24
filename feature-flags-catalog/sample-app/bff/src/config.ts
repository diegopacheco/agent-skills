const FLAG_PREFIX = "FEATURE_";

function flagName(envKey: string): string {
  return envKey.slice(FLAG_PREFIX.length).toLowerCase().replaceAll("_", "-");
}

export function readFlags(env: Readonly<Record<string, string | undefined>>): Readonly<Record<string, boolean>> {
  return Object.freeze(Object.fromEntries(Object.entries(env).filter(([k]) => k.startsWith(FLAG_PREFIX)).map(([k, v]) => [flagName(k), v === "true"])));
}

export const config = Object.freeze({
  port: Number(process.env.BFF_PORT ?? 3001),
  backendUrl: process.env.BACKEND_URL ?? "http://localhost:8081",
  serviceName: "shop-bff",
  timeoutMs: 3000,
  cacheTtlMs: 30000,
  flags: readFlags(process.env),
});
