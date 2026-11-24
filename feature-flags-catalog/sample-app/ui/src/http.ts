import { config } from "./config";
import { CORRELATION_HEADER, currentCorrelationId } from "./logger";

export class ApiError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function request<T>(path: string, parse: (raw: unknown) => T): Promise<T> {
  const res = await fetch(`${config.apiUrl}${path}`, { headers: { [CORRELATION_HEADER]: currentCorrelationId() } });
  if (!res.ok) throw new ApiError(res.status, await res.text());
  return parse(await res.json());
}

export const http = {
  get: <T,>(path: string, parse: (raw: unknown) => T) => request(path, parse),
};
