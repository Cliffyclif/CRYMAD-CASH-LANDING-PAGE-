/**
 * TygaBank HMAC SHA256 request signing.
 *
 * Per TygaPay docs + their Postman pre-request script:
 *   stringToSign = apiPath + queryString + bodyAsQueryString
 *   x-api-hash   = HmacSHA256(stringToSign, api-secret).hex
 *
 * Body is flattened to query string format using dots for nested fields,
 * e.g. { user: { id: 1 } } -> "user.id=1"
 *
 * Two signing variants exist in their Postman collection. Both return 200 —
 * we use the canonical (full path+query WITH "?") formula.
 */

import crypto from "node:crypto";

const API_SECRET = process.env.TYGABANK_API_SECRET!;
const API_KEY = process.env.TYGABANK_API_KEY!;

if (!API_SECRET || !API_KEY) {
  // Don't throw at import time — throw when actually called without creds.
  // This lets the dev server start without crashing if env is missing.
}

/** Flatten nested object to query string (dot-notation, no encoding). */
export function flattenBody(obj: unknown, parentKey = ""): string {
  if (obj === null || obj === undefined) return "";
  const parts: string[] = [];
  const entries = Object.entries(obj as Record<string, unknown>);
  for (const [key, value] of entries) {
    const fullKey = parentKey ? `${parentKey}.${key}` : key;
    if (value !== null && typeof value === "object" && !Array.isArray(value)) {
      parts.push(flattenBody(value, fullKey));
    } else {
      parts.push(`${fullKey}=${value ?? ""}`);
    }
  }
  return parts.filter(Boolean).join("&");
}

/**
 * Build the stringToSign for a request.
 * @param path - API path starting with `/` (e.g. `/user/abc`)
 * @param query - Query params as object, or raw query string (no `?` prefix)
 * @param body - Request body (JSON object) or undefined
 */
export function buildStringToSign(
  path: string,
  query?: Record<string, string | number | undefined> | string,
  body?: unknown,
): string {
  let qs = "";
  if (typeof query === "string") {
    qs = query;
  } else if (query) {
    const parts: string[] = [];
    for (const [k, v] of Object.entries(query)) {
      if (v !== undefined && v !== null && v !== "") parts.push(`${k}=${v}`);
    }
    qs = parts.join("&");
  }

  const bodyStr = body ? flattenBody(body) : "";
  // Canonical form: apiPath + "?" + queryString + bodyString (if query exists)
  // OR: apiPath + bodyString (if no query)
  const pathWithQuery = qs ? `${path}?${qs}` : path;
  return `${pathWithQuery}${bodyStr}`;
}

/** HMAC-SHA256 hex digest. */
export function signHMAC(stringToSign: string): string {
  if (!API_SECRET) throw new Error("TYGABANK_API_SECRET is not set");
  return crypto
    .createHmac("sha256", API_SECRET)
    .update(stringToSign)
    .digest("hex");
}

/** Returns the standard headers for a TygaBank request. */
export function buildHeaders(stringToSign: string): Record<string, string> {
  if (!API_KEY) throw new Error("TYGABANK_API_KEY is not set");
  return {
    "x-api-key": API_KEY,
    "x-api-hash": signHMAC(stringToSign),
    "Content-Type": "application/json",
  };
}
