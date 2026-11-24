import { Router } from "express";
import { AppError } from "../errors.ts";
import type { CatalogService } from "./service.ts";

const REGIONS = new Set(["eu", "us"]);

function parseRegion(raw: unknown): string {
  const region = typeof raw === "string" ? raw : "eu";
  if (!REGIONS.has(region)) throw new AppError(400, `unknown region ${region}`);
  return region;
}

export function catalogRouter(service: CatalogService): Router {
  const router = Router();
  router.get("/catalog", async (req, res) => {
    res.json(await service.catalog(parseRegion(req.query.region)));
  });
  router.get("/checkout/mode", async (_req, res) => {
    res.json(await service.checkoutMode());
  });
  return router;
}
