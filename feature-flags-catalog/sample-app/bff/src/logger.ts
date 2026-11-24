import { AsyncLocalStorage } from "node:async_hooks";
import { randomUUID } from "node:crypto";
import type { RequestHandler } from "express";

export const CORRELATION_HEADER = "x-correlation-id";

type RequestContext = { readonly correlationId: string; readonly path: string };
type Fields = Readonly<Record<string, unknown>>;

const storage = new AsyncLocalStorage<RequestContext>();

export function correlationId(): string {
  return storage.getStore()?.correlationId ?? randomUUID();
}

export const correlationMiddleware: RequestHandler = (req, res, next) => {
  const id = req.header(CORRELATION_HEADER) ?? randomUUID();
  res.setHeader(CORRELATION_HEADER, id);
  storage.run({ correlationId: id, path: req.path }, next);
};

function write(level: "info" | "warn" | "error", event: string, fields: Fields): void {
  const ctx = storage.getStore();
  const entry = { time: new Date().toISOString(), level, event, service: "shop-bff", correlationId: ctx?.correlationId, path: ctx?.path, ...fields };
  process.stdout.write(`${JSON.stringify(entry)}\n`);
}

export const logger = {
  info: (event: string, fields: Fields = {}) => write("info", event, fields),
  warn: (event: string, fields: Fields = {}) => write("warn", event, fields),
  error: (event: string, fields: Fields = {}) => write("error", event, fields),
};

export type Logger = typeof logger;
