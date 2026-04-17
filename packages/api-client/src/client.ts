import { sign } from "./signer.js";
import type { ServiceName, TygaConfig, TygaError } from "./types.js";

const DEBUG = process.env.TYGA_DEBUG === "1";

export interface RequestOptions {
  service: ServiceName;
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  path: string;
  query?: Record<string, string | number | boolean | undefined>;
  body?: Record<string, unknown>;
}

export class TygaClient {
  constructor(private config: TygaConfig) {}

  async request<T = unknown>(opts: RequestOptions): Promise<T> {
    const baseUrl = this.config.urls[opts.service];
    const hasBody = opts.body !== undefined;

    const { hash, stringToSign, pathWithQuery, signedBody } = sign({
      path: opts.path,
      query: opts.query,
      body: opts.body,
      apiSecret: this.config.apiSecret,
    });
    if (DEBUG) {
      console.log("[tyga] ►", opts.method, opts.service + opts.path);
      console.log("[tyga]   stringToSign:", stringToSign);
      console.log("[tyga]   hash:", hash.slice(0, 16) + "...");
    }

    // Send the URL exactly as signed — path + '?' + query with NO URL encoding, matching the
    // stringToSign the server will reconstruct from pm.request.url.getPathWithQuery().
    const url = `${baseUrl}${pathWithQuery}`;
    const finalBody = signedBody;

    const res = await fetch(url, {
      method: opts.method,
      headers: {
        "content-type": "application/json",
        "x-api-key": this.config.apiKey,
        "x-api-hash": hash,
      },
      body: finalBody ? JSON.stringify(finalBody) : undefined,
    });

    const text = await res.text();
    let parsed: unknown;
    try {
      parsed = text ? JSON.parse(text) : undefined;
    } catch {
      parsed = text;
    }

    if (!res.ok) {
      if (DEBUG) {
        console.log("[tyga]   ◄", res.status, res.statusText);
        console.log("[tyga]   body:", typeof parsed === "string" ? parsed.slice(0, 200) : JSON.stringify(parsed).slice(0, 200));
      }
      const err: TygaError = {
        status: res.status,
        message: typeof parsed === "object" && parsed && "message" in parsed
          ? String((parsed as { message: unknown }).message)
          : res.statusText || "TygaPay request failed",
        raw: parsed,
      };
      throw err;
    }

    if (DEBUG) console.log("[tyga]   ◄", res.status, "OK");
    return parsed as T;
  }
}

export function createTygaClient(config: TygaConfig): TygaClient {
  return new TygaClient(config);
}
