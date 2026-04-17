import type { TygaClient } from "../client.js";

export interface TenantWallet {
  walletId: string;
  walletType: string;
  currency: string;
  balance: number;
  address?: string;
  [k: string]: unknown;
}

export interface TotalUserBalances {
  walletType?: string;
  totalBalance: number;
  currency: string;
  userCount?: number;
  [k: string]: unknown;
}

export const tenantsApi = {
  getTenantWallets: (c: TygaClient) =>
    c.request<TenantWallet[]>({ service: "tenants", method: "GET", path: "/api-tenants/wallets" }),

  getTotalUserBalances: (c: TygaClient, query: { walletTypes?: string } = {}) =>
    c.request<TotalUserBalances[]>({
      service: "tenants",
      method: "GET",
      path: "/api-tenants/users/total-balances",
      query,
    }),
};
