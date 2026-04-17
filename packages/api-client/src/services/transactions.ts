import type { TygaClient } from "../client.js";

export interface Transaction {
  transactionId: string;
  externalTransactionId?: string;
  userId: string;
  amount: number;
  currency: string;
  status: "pending" | "success" | "cancelled" | "failed" | string;
  type?: string;
  createdAt?: string;
  [k: string]: unknown;
}

export type PayoutCurrency = "USD" | "EUR" | "JPY" | "CAD";

export const transactionsApi = {
  createPayout: (
    c: TygaClient,
    body: {
      userId: string;
      amount: number;
      externalTransactionId: string;
      createdBy: string;
      email?: string;
      currency?: PayoutCurrency;
      processImmediately?: boolean;
      webhookUrl?: string;
    },
  ) => c.request<{ transactionId: string; externalTransactionId: string; status: string }>({
    service: "transactions", method: "POST", path: "/payout", body,
  }),

  confirmPayout: (c: TygaClient, transactionId: string, body: { createdBy: string }) =>
    c.request<Transaction>({
      service: "transactions", method: "POST", path: `/payout/${transactionId}/confirm`, body,
    }),

  cancelPayout: (c: TygaClient, transactionId: string, body: { createdBy: string }) =>
    c.request<Transaction>({
      service: "transactions", method: "POST", path: `/payout/${transactionId}/cancel`, body,
    }),

  getPayout: (c: TygaClient, transactionId: string) =>
    c.request<Transaction>({ service: "transactions", method: "GET", path: `/payout/${transactionId}` }),

  ewalletDebit: (c: TygaClient, body: {
    userId: string; amount: number; currency: string; externalTransactionId: string; createdBy: string;
  }) => c.request<Transaction>({ service: "transactions", method: "POST", path: "/ewallet/debit", body }),

  ewalletDebitRefund: (c: TygaClient, body: { transactionId: string; createdBy: string }) =>
    c.request<Transaction>({ service: "transactions", method: "POST", path: "/ewallet/debit/refund", body }),

  listUserTransactions: (c: TygaClient, userId: string) =>
    c.request<Transaction[]>({ service: "transactions", method: "GET", path: "/transactions/users", query: { userId } }),
};
