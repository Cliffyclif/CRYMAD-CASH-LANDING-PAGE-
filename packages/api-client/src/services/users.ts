import type { TygaClient } from "../client.js";

export interface TygaUser {
  userId?: string;
  externalUserId?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  createdAt?: string;
  status?: string;
  [k: string]: unknown;
}

export interface UserWallet {
  walletId: string;
  walletType: string;
  currency: string;
  balance: number;
  available?: number;
  [k: string]: unknown;
}

export interface CryptoDepositAddress {
  asset: string;
  network?: string;
  address: string;
  tag?: string;
}

export const usersApi = {
  createUser: (c: TygaClient, body: Partial<TygaUser>) =>
    c.request<TygaUser>({ service: "users", method: "POST", path: "/user", body }),

  getUser: (c: TygaClient, userId: string) =>
    c.request<TygaUser>({ service: "users", method: "GET", path: `/user/${userId}` }),

  getUserBy: (c: TygaClient, q: { email?: string; userId?: string; externalUserId?: string }) =>
    c.request<TygaUser>({ service: "users", method: "GET", path: "/user", query: q }),

  checkExists: (c: TygaClient, body: { email?: string; externalUserId?: string }) =>
    c.request<{ exists: boolean }>({ service: "users", method: "POST", path: "/user/exists", body }),

  getUserWallets: (c: TygaClient, userId: string) =>
    c.request<UserWallet[]>({ service: "users", method: "GET", path: `/user/${userId}/wallet` }),

  getCryptoDepositAddresses: (c: TygaClient, userId: string) =>
    c.request<CryptoDepositAddress[]>({
      service: "users",
      method: "GET",
      path: `/user/${userId}/crypto/deposit-addresses`,
    }),

  claimCryptoDepositAddress: (c: TygaClient, userId: string, body: { asset: string; network?: string }) =>
    c.request<CryptoDepositAddress>({
      service: "users",
      method: "POST",
      path: `/user/${userId}/crypto/claim-deposit-address`,
      body,
    }),

  createKycSession: (c: TygaClient, userId: string, body: Record<string, unknown> = {}) =>
    c.request<{ sessionUrl: string; sessionId: string }>({
      service: "users",
      method: "POST",
      path: `/user/${userId}/kyc/session`,
      body,
    }),

  sendVerifyEmail: (c: TygaClient, userId: string) =>
    c.request<{ status: string }>({
      service: "users",
      method: "POST",
      path: `/user/${userId}/send-verify-email`,
      body: {},
    }),

  listTenantUsers: (c: TygaClient, query: { limit?: number; cursor?: string; createdAfter?: string; createdBefore?: string } = {}) =>
    c.request<{ users: TygaUser[]; nextCursor?: string }>({
      service: "tenants",
      method: "GET",
      path: "/api-tenants/users",
      query,
    }),
};
