/**
 * TygaBank API client — server-side only.
 *
 * Usage (from API routes / server components):
 *   import { tyga } from "@/lib/tygabank/client";
 *   const user = await tyga.users.getById("4AnfKn3...");
 */

import { buildStringToSign, buildHeaders } from "./sign";

type ServiceName =
  | "users"
  | "auth"
  | "orders"
  | "rewards"
  | "reporting"
  | "transactions"
  | "cards"
  | "crypto"
  | "tenants";

const BASE_URLS: Record<ServiceName, string | undefined> = {
  users: process.env.TYGABANK_URL_USERS,
  auth: process.env.TYGABANK_URL_AUTH,
  orders: process.env.TYGABANK_URL_ORDERS,
  rewards: process.env.TYGABANK_URL_REWARDS,
  reporting: process.env.TYGABANK_URL_REPORTING,
  transactions: process.env.TYGABANK_URL_TRANSACTIONS,
  cards: process.env.TYGABANK_URL_CARDS,
  crypto: process.env.TYGABANK_URL_CRYPTO,
  tenants: process.env.TYGABANK_URL_TENANTS,
};

function baseUrl(svc: ServiceName): string {
  const u = BASE_URLS[svc];
  if (!u) throw new Error(`TYGABANK_URL_${svc.toUpperCase()} is not set`);
  return u;
}

function now(): number {
  return Date.now();
}

export class TygaBankError extends Error {
  constructor(
    public status: number,
    public body: unknown,
    message?: string,
  ) {
    super(message || `TygaBank error ${status}`);
    this.name = "TygaBankError";
  }
}

/** Core request function. */
async function request<T = unknown>(
  svc: ServiceName,
  method: "GET" | "POST" | "PUT" | "DELETE",
  path: string,
  opts: {
    query?: Record<string, string | number | undefined>;
    body?: unknown;
  } = {},
): Promise<T> {
  // BFF proxy mode: route every TygaBank call through BFF's static-IP service.
  // TygaBank production only accepts traffic from BFF's whitelisted IP, so in prod
  // we MUST NOT call TygaBank directly from this Next.js process.
  const bffBase = process.env.BFF_BASE_URL;
  if (bffBase) {
    return requestViaBff<T>(svc, method, path, opts);
  }

  const url = baseUrl(svc);
  // Always add timestamp (query for GET, body for POST/PUT)
  const ts = now();
  const query = { ...(opts.query ?? {}) };
  let body: unknown = opts.body;
  if (method === "GET" || method === "DELETE") {
    query.timestamp = ts;
  } else {
    body = { ...(body as object ?? {}), timestamp: ts };
  }

  const stringToSign = buildStringToSign(path, query, body);
  const headers = buildHeaders(stringToSign);

  // Must match the unencoded form used in stringToSign (TygaBank verifies raw).
  const qs = Object.entries(query)
    .filter(([, v]) => v !== undefined && v !== null && v !== "")
    .map(([k, v]) => `${k}=${v}`)
    .join("&");
  const fullUrl = `${url}${path}${qs ? `?${qs}` : ""}`;

  const res = await fetch(fullUrl, {
    method,
    headers,
    body: body && method !== "GET" && method !== "DELETE" ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });

  const text = await res.text();
  let data: unknown = text;
  try {
    data = JSON.parse(text);
  } catch {
    // non-JSON response (e.g. health check "OK")
  }

  if (!res.ok) {
    throw new TygaBankError(res.status, data, `${method} ${path} failed: ${res.status}`);
  }
  return data as T;
}

async function requestViaBff<T>(
  svc: ServiceName,
  method: "GET" | "POST" | "PUT" | "DELETE",
  path: string,
  opts: { query?: Record<string, string | number | undefined>; body?: unknown },
): Promise<T> {
  const base = process.env.BFF_BASE_URL!.replace(/\/+$/, "");
  const secret = process.env.TYGA_PROXY_SECRET;
  if (!secret) throw new Error("TYGA_PROXY_SECRET is not set (required when BFF_BASE_URL is set)");

  const qsParts: string[] = [];
  for (const [k, v] of Object.entries(opts.query ?? {})) {
    if (v === undefined || v === null || v === "") continue;
    qsParts.push(`${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`);
  }
  const qs = qsParts.join("&");
  const proxyPath = path.startsWith("/") ? path : `/${path}`;
  const fullUrl = `${base}/tyga/${svc}${proxyPath}${qs ? `?${qs}` : ""}`;

  const res = await fetch(fullUrl, {
    method,
    headers: {
      "content-type": "application/json",
      "x-internal-secret": secret,
    },
    body: opts.body !== undefined && method !== "GET" && method !== "DELETE"
      ? JSON.stringify(opts.body)
      : undefined,
    cache: "no-store",
  });

  const text = await res.text();
  let envelope: { ok?: boolean; data?: unknown; error?: string; status?: number; raw?: unknown } | string = text;
  try { envelope = JSON.parse(text); } catch { /* non-JSON */ }

  if (!res.ok || (typeof envelope === "object" && envelope.ok === false)) {
    const upstreamStatus = typeof envelope === "object" && envelope.status ? envelope.status : res.status;
    const raw = typeof envelope === "object" ? envelope.raw : envelope;
    throw new TygaBankError(upstreamStatus, raw, `${method} ${path} via BFF failed: ${upstreamStatus}`);
  }
  return (typeof envelope === "object" ? (envelope.data as T) : (envelope as T));
}

// ─── Types (partial, from real API responses) ──────────────────────────────

export type TygaUserType = "individual" | "business";
export type KycStatus = "not_started" | "pending" | "approved" | "rejected";
export type WalletType = "ewallet" | "crypto" | "card" | "rewards";

export interface TygaUser {
  id: string;
  isActive: boolean;
  email: string;
  firstName?: string;
  lastName?: string;
  kycStatus: KycStatus;
  completedRegistration: boolean;
  emailIsVerified: boolean;
  externalUserId?: string;
  type?: TygaUserType;
  dateOfBirth?: string;
  phoneNumber?: string;
  createdBy?: string;
  createdSource?: string;
  createdDate: string;
  modifiedDate?: string;
}

export interface TygaWallet {
  id: string;
  type: WalletType;
  userId: string;
  name: string;
  currency: string;
  balance: number;
  balanceLocked: number;
  pendingPayouts: number;
  totalPayouts: number;
  createdDate: string;
  modifiedDate: string;
}

export interface TygaAddress {
  addressLine1: string;
  addressLine2?: string;
  city: string;
  subdivision: string;
  postalCode: string;
  country: string;
}

export interface CreateUserInput {
  email: string;
  externalUserId?: string;
  firstName?: string;
  lastName?: string;
  createdBy?: string;
  dateOfBirth?: string;
  type?: TygaUserType;
  customerAddress?: TygaAddress;
  phoneNumber?: string;
  sendWelcomeEmail?: boolean;
  autoVerifyEmail?: boolean;
}

export interface CompleteRegistrationInput {
  firstName: string;
  lastName: string;
  address: TygaAddress;
  dateOfBirth: string;
  phoneNumber: string;
  languageCode?: string;
}

export interface CryptoDepositAddress {
  address: string;
  network: string;
  supportedTokens?: string[];
}

export interface TygaTransaction {
  id: string;
  status: string;
  type: string;
  side?: "credit" | "debit";
  amount: number;
  fee?: number;
  currency?: string;
  walletType?: WalletType;
  userId?: string;
  email?: string;
  orderId?: string;
  externalTransactionId?: string;
  reference?: string;
  txHash?: string;
  network?: string;
  confirmations?: number;
  createdDate: string;
  modifiedDate?: string;
  completedDate?: string;
}

// ─── Typed API methods ─────────────────────────────────────────────────────

export const tyga = {
  // USERS
  users: {
    create: (input: CreateUserInput) =>
      request<TygaUser>("users", "POST", "/user", { body: input }),
    getById: (userId: string) =>
      request<TygaUser>("users", "GET", `/user/${userId}`),
    getByEmail: (email: string) =>
      request<{ users: TygaUser[] } | TygaUser>("users", "GET", "/user", {
        query: { email },
      }),
    getByExternalId: (externalUserId: string) =>
      request<TygaUser>("users", "GET", "/user", { query: { externalUserId } }),
    update: (userId: string, input: Partial<CompleteRegistrationInput>) =>
      request<TygaUser>("users", "POST", `/user/${userId}/complete-registration`, {
        body: input,
      }),
    list: (opts: { limit?: number; cursor?: string; startDate?: string; endDate?: string } = {}) =>
      request<{ users: TygaUser[]; cursor?: string }>("users", "GET", "/users", {
        query: opts,
      }),
    exists: (input: { email?: string; externalUserId?: string }) =>
      request<{ exists: boolean }>("users", "POST", "/user/exists", { body: input }),
    getWallets: (userId: string) =>
      request<TygaWallet[]>("users", "GET", `/user/${userId}/wallet`),
    sendVerifyEmail: (userId: string) =>
      request<{ success: boolean }>("users", "POST", `/user/${userId}/send-verify-email`),
    confirmVerifyEmail: (userId: string, code?: string) =>
      request<{ verified: boolean }>(
        "users",
        "POST",
        `/user/${userId}/confirm-verify-email`,
        { body: code ? { code } : {} },
      ),
    resendWelcomeEmail: (userId: string) =>
      request<{ success: boolean }>("users", "POST", `/user/${userId}/resend-welcome-email`),
    startKycSession: (userId: string) =>
      request<{ sessionUrl?: string; sessionToken?: string }>(
        "users",
        "POST",
        `/user/${userId}/kyc/session`,
      ),
    link: (input: { email: string; externalUserId: string }) =>
      request<{ linked: boolean }>("users", "POST", "/user/link", { body: input }),
    unlink: (input: { email: string }) =>
      request<{ unlinked: boolean }>("users", "POST", "/user/unlink", { body: input }),
    // Crypto
    createCryptoWallet: (userId: string) =>
      request("users", "POST", `/user/${userId}/crypto/wallet`),
    syncCryptoWallet: (userId: string) =>
      request("users", "POST", `/user/${userId}/crypto/sync`),
    claimCryptoDepositAddress: (userId: string, network: string) =>
      request<CryptoDepositAddress>(
        "users",
        "POST",
        `/user/${userId}/crypto/claim-deposit-address`,
        { body: { network } },
      ),
    getCryptoDepositAddresses: (userId: string) =>
      request<CryptoDepositAddress[]>(
        "users",
        "GET",
        `/user/${userId}/crypto/deposit-addresses`,
      ),
  },

  // AUTH
  auth: {
    getClientToken: (input: { userId?: string; externalUserId?: string }) =>
      request<{ token: string; expiresAt?: string }>("auth", "POST", "/client-token", { body: input }),
  },

  // ORDERS
  orders: {
    create: (body: Record<string, unknown>) =>
      request<{ orderId: string; paymentUrl?: string; paymentDeepLinkUrl?: string }>(
        "orders",
        "POST",
        "/",
        { body },
      ),
    getById: (orderId: string) =>
      request("orders", "GET", `/${orderId}`),
    refund: (body: Record<string, unknown>) =>
      request("orders", "POST", "/refund", { body }),
    // Subscriptions
    subscriptions: {
      create: (body: Record<string, unknown>) =>
        request("orders", "POST", "/subscriptions", { body }),
      cancel: (id: string, body: Record<string, unknown>) =>
        request("orders", "PUT", `/subscriptions/${id}/cancel`, { body }),
      getById: (id: string) => request("orders", "GET", `/subscriptions/${id}`),
    },
  },

  // TRANSACTIONS
  transactions: {
    createPayout: (body: Record<string, unknown>) =>
      request("transactions", "POST", "/payout", { body }),
    confirmPayout: (id: string, body: Record<string, unknown>) =>
      request("transactions", "POST", `/payout/${id}/confirm`, { body }),
    cancelPayout: (id: string, body: Record<string, unknown>) =>
      request("transactions", "POST", `/payout/${id}/cancel`, { body }),
    getPayout: (id: string) => request("transactions", "GET", `/payout/${id}`),
    // Recurring
    createRecurring: (body: Record<string, unknown>) =>
      request("transactions", "POST", "/recurring-payment", { body }),
    // E-Wallet debits
    ewalletDebit: (body: Record<string, unknown>) =>
      request("transactions", "POST", "/ewallet/debit", { body }),
    ewalletDebitRefund: (body: Record<string, unknown>) =>
      request("transactions", "POST", "/ewallet/debit/refund", { body }),
  },

  // CARDS
  cards: {
    createAccount: (userId: string, body: Record<string, unknown>) =>
      request("cards", "POST", `/account/${userId}`, { body }),
    getAccount: (userId: string) =>
      request("cards", "GET", `/account/${userId}`),
    getKycStatus: (userId: string) =>
      request("cards", "GET", `/account/${userId}/kyc-status`),
    orderCards: (userId: string, body: Record<string, unknown>) =>
      request("cards", "POST", `/cards/${userId}/order`, { body }),
    orderSingle: (userId: string, body: Record<string, unknown>) =>
      request("cards", "POST", `/cards/${userId}/order-single`, { body }),
    load: (userId: string, cardId: string, body: Record<string, unknown>) =>
      request("cards", "POST", `/cards/${userId}/${cardId}/load`, { body }),
    lock: (userId: string, cardId: string, body: Record<string, unknown>) =>
      request("cards", "POST", `/cards/${userId}/${cardId}/lock`, { body }),
    unlock: (userId: string, cardId: string, body: Record<string, unknown>) =>
      request("cards", "POST", `/cards/${userId}/${cardId}/unlock`, { body }),
    activate: (userId: string, cardId: string, body: Record<string, unknown>) =>
      request("cards", "POST", `/cards/${userId}/${cardId}/activate`, { body }),
    getCredentials: (userId: string, cardId: string, body: Record<string, unknown>) =>
      request("cards", "POST", `/cards/${userId}/${cardId}/credentials`, { body }),
    sync: (userId: string) =>
      request("cards", "POST", `/cards/${userId}/sync`),
    getFees: () => request("cards", "GET", "/fees/v2"),
    getOrderQuote: (userId: string, q: Record<string, string | number | undefined>) =>
      request("cards", "GET", `/cards/${userId}/order/quote`, { query: q }),
    getSingleQuote: (userId: string, q: Record<string, string | number | undefined>) =>
      request("cards", "GET", `/cards/${userId}/order-single/quote`, { query: q }),
    sendOtp: (userId: string, body: Record<string, unknown>) =>
      request("cards", "POST", `/otp/${userId}/send`, { body }),
    getLoadTx: (userId: string, cardId: string, txId: string) =>
      request("cards", "GET", `/cards/${userId}/${cardId}/load/${txId}`),
    getTx: (userId: string, txId: string) =>
      request("cards", "GET", `/transactions/${userId}/${txId}`),
  },

  // CRYPTO
  crypto: {
    estimateSwap: (body: Record<string, unknown>) =>
      request("crypto", "POST", "/swaps/external/estimate", { body }),
    createSwap: (body: Record<string, unknown>) =>
      request("crypto", "POST", "/swaps/external", { body }),
    getSwap: (userId: string, txId: string) =>
      request("crypto", "GET", `/swaps/external/${userId}/${txId}`),
    sendOtp: (body: Record<string, unknown>) =>
      request("crypto", "POST", "/otp/send", { body }),
    createCustodial: (body: Record<string, unknown>) =>
      request("crypto", "POST", "/wallets/custodial/create", { body }),
    sendCustodial: (body: Record<string, unknown>) =>
      request("crypto", "POST", "/wallets/custodial/send", { body }),
    getCustodial: (userId: string, token: string) =>
      request("crypto", "GET", `/wallets/custodial/${userId}/${token}`),
    listCustodial: (userId: string) =>
      request("crypto", "GET", `/wallets/custodial/${userId}`),
  },

  // REWARDS
  rewards: {
    payout: (body: Record<string, unknown>) =>
      request("rewards", "POST", "/payout", { body }),
    batchPayout: (body: Record<string, unknown>) =>
      request("rewards", "POST", "/payout/batch", { body }),
    debit: (body: Record<string, unknown>) =>
      request("rewards", "POST", "/debit", { body }),
    debitRefund: (body: Record<string, unknown>) =>
      request("rewards", "POST", "/debit/refund", { body }),
  },

  // REPORTING
  reporting: {
    tenantTransactions: (q: Record<string, string | number | undefined>) =>
      request<TygaTransaction[]>("reporting", "GET", "/transactions/tenant", { query: q }),
    userTransactions: (q: Record<string, string | number | undefined>) =>
      request<TygaTransaction[]>("reporting", "GET", "/transactions/users", { query: q }),
  },

  // TENANTS
  tenants: {
    wallets: () => request("tenants", "GET", "/api-tenants/wallets"),
    totalUserBalances: (walletTypes?: string) =>
      request("tenants", "GET", "/api-tenants/users/total-balances", {
        query: walletTypes ? { walletTypes } : undefined,
      }),
  },
};

export type Tyga = typeof tyga;
