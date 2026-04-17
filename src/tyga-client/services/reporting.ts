import type { TygaClient } from "../client.js";

export interface ReportRow {
  date: string;
  type: string;
  walletType?: string;
  amount: number;
  currency: string;
  userId?: string;
  transactionId?: string;
  [k: string]: unknown;
}

export const reportingApi = {
  tenantTransactions: (c: TygaClient, query: { startDate: string; endDate: string; type?: string; walletType?: string }) =>
    c.request<ReportRow[]>({
      service: "reporting", method: "GET", path: "/transactions/tenant", query,
    }),

  usersTransactions: (c: TygaClient, query: { startDate: string; endDate: string; type?: string; walletType?: string; userIds?: string }) =>
    c.request<ReportRow[]>({
      service: "reporting", method: "GET", path: "/transactions/users", query,
    }),
};
