import express, { type Express } from "express";
import { catalogRouter } from "./catalog/routes.ts";
import type { CatalogService } from "./catalog/service.ts";
import { errorHandler } from "./errors.ts";
import { correlationMiddleware } from "./logger.ts";

export type Deps = { readonly catalog: CatalogService };

export function createApp(deps: Deps): Express {
  const app = express();
  app.use(correlationMiddleware);
  app.use(express.json());
  app.use("/api", catalogRouter(deps.catalog));
  app.use(errorHandler);
  return app;
}
