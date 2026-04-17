import type { TygaClient } from "../client.js";

export const rewardsApi = {
  createRewardPayout: (c: TygaClient, body: { userId: string; amount: number; externalTransactionId: string; createdBy: string }) =>
    c.request<{ transactionId: string; status: string }>({
      service: "rewards", method: "POST", path: "/payout", body,
    }),

  createRewardBatch: (c: TygaClient, body: { payouts: Array<{ userId: string; amount: number; externalTransactionId: string }>; createdBy: string }) =>
    c.request<{ batchId: string; count: number }>({
      service: "rewards", method: "POST", path: "/payout/batch", body,
    }),

  rewardsDebit: (c: TygaClient, body: { userId: string; amount: number; externalTransactionId: string; createdBy: string }) =>
    c.request<{ transactionId: string; status: string }>({
      service: "rewards", method: "POST", path: "/debit", body,
    }),
};
