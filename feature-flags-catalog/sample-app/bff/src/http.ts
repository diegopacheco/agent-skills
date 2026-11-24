import { AppError } from "./errors.ts";
import { CORRELATION_HEADER, correlationId } from "./logger.ts";

export function httpClient(baseUrl: string, timeoutMs: number) {
  return {
    async getJson<T>(path: string, parse: (raw: unknown) => T): Promise<T> {
      const res = await fetch(new URL(path, baseUrl), {
        signal: AbortSignal.timeout(timeoutMs),
        headers: { [CORRELATION_HEADER]: correlationId() },
      });
      if (!res.ok) throw new AppError(502, `upstream ${path} returned ${res.status}`);
      return parse(await res.json());
    },
  };
}

export type HttpClient = ReturnType<typeof httpClient>;
