import { createHmac } from "node:crypto";

/**
 * Flatten a JSON body into dot-notation query-string form per TygaPay spec.
 * Mirrors `qsStringify` from the Postman pre-request script verbatim:
 *   - nested objects flatten with dot keys (e.g. user.id=1)
 *   - values are inserted literally, no URL encoding
 *   - iteration follows insertion order
 */
function qsStringify(obj: Record<string, unknown> | undefined, parentKey = ""): string {
  if (!obj || typeof obj !== "object") return "";
  const parts: string[] = [];
  for (const [key, value] of Object.entries(obj)) {
    if (value === undefined || value === null) continue;
    const fullKey = parentKey ? `${parentKey}.${key}` : key;
    if (typeof value === "object" && !Array.isArray(value)) {
      parts.push(qsStringify(value as Record<string, unknown>, fullKey));
    } else if (Array.isArray(value)) {
      value.forEach((v, i) => {
        if (typeof v === "object" && v !== null) {
          parts.push(qsStringify(v as Record<string, unknown>, `${fullKey}.${i}`));
        } else {
          parts.push(`${fullKey}.${i}=${v}`);
        }
      });
    } else {
      parts.push(`${fullKey}=${value}`);
    }
  }
  return parts.filter(Boolean).join("&");
}

export interface SignInput {
  path: string;
  query?: Record<string, string | number | boolean | undefined>;
  body?: Record<string, unknown>;
  apiSecret: string;
}

export interface SignResult {
  hash: string;
  timestamp: number;
  stringToSign: string;
  pathWithQuery: string;
  signedBody?: Record<string, unknown>;
}

/**
 * Generate x-api-hash for a TygaPay request.
 *
 * Matches the Postman pre-request script algorithm:
 *   let url  = pm.request.url.getPathWithQuery();  // path + '?' + query  (no URL encoding)
 *   let body = qsStringify(JSON.parse(request.body));
 *   const stringToSign = `${url}${body}`;
 *   hash = HmacSHA256(stringToSign, apiSecret)
 *
 * Timestamp is injected into the body for POST/PUT/PATCH, or into the query for GET/DELETE.
 * Timestamp is placed FIRST in the query to match the ordering used across the Postman collection.
 */
export function sign({ path, query, body, apiSecret }: SignInput): SignResult {
  const timestamp = Date.now();
  const hasBody = body !== undefined;

  // Build final query: timestamp first (matches Postman URL conventions), then caller's params.
  const finalQuery: Record<string, string | number | boolean> = {};
  if (!hasBody) {
    finalQuery.timestamp = timestamp;
  }
  if (query) {
    for (const [k, v] of Object.entries(query)) {
      if (v === undefined || v === null) continue;
      finalQuery[k] = v;
    }
  }

  // Encode query values so that reserved characters (+, @, spaces, etc.) survive server-side
  // URL decoding. Both the stringToSign and the outgoing URL use the SAME encoded form, so the
  // HMAC still matches on the server.
  const queryParts: string[] = [];
  for (const [k, v] of Object.entries(finalQuery)) {
    queryParts.push(`${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`);
  }
  const queryString = queryParts.join("&");

  // pathWithQuery is exactly what Postman's getPathWithQuery() returns: path + '?' + query (if any)
  const pathWithQuery = queryString ? `${path}?${queryString}` : path;

  // Body: inject timestamp (as first key, matching Postman behavior) and qsStringify it.
  let signedBody: Record<string, unknown> | undefined;
  let stringifiedBody = "";
  if (hasBody && body) {
    signedBody = { timestamp, ...body };
    stringifiedBody = qsStringify(signedBody);
  }

  const stringToSign = `${pathWithQuery}${stringifiedBody}`;
  const hash = createHmac("sha256", apiSecret).update(stringToSign).digest("hex");

  return { hash, timestamp, stringToSign, pathWithQuery, signedBody };
}
