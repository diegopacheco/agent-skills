import { createApp } from "./app.ts";
import { backendGateway } from "./catalog/backend.ts";
import { catalogService } from "./catalog/service.ts";
import { config } from "./config.ts";
import { featureFlags } from "./flags.ts";
import { httpClient } from "./http.ts";
import { logger } from "./logger.ts";

const flags = featureFlags(config.flags, logger);
const backend = backendGateway(httpClient(config.backendUrl, config.timeoutMs));
const catalog = catalogService(backend, flags, { now: () => Date.now() }, config.cacheTtlMs);
const server = createApp({ catalog }).listen(config.port, () => logger.info("bff started", { port: config.port }));
process.on("SIGTERM", () => server.close());
