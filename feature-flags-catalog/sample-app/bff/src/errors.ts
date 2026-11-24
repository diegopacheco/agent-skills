import type { ErrorRequestHandler } from "express";
import { logger } from "./logger.ts";

export class AppError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof AppError) {
    res.status(err.status).json({ error: err.message });
    return;
  }
  logger.error("unhandled error", { error: String(err) });
  res.status(500).json({ error: "internal error" });
};
