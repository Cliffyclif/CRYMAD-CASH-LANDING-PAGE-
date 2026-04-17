import type { TygaClient } from "../client.js";

export interface CardAccount {
  userId: string;
  kycStatus?: "verified" | "pending" | "pending_approval" | string;
  status?: string;
  [k: string]: unknown;
}

export interface Card {
  cardId: string;
  userId: string;
  last4?: string;
  cardType?: "virtual" | "physical";
  status?: "active" | "locked" | "pending" | string;
  balance?: number;
  [k: string]: unknown;
}

export const cardsApi = {
  createAccount: (c: TygaClient, userId: string, body: Record<string, unknown>) =>
    c.request<CardAccount>({ service: "cards", method: "POST", path: `/account/${userId}`, body }),

  getAccount: (c: TygaClient, userId: string) =>
    c.request<CardAccount>({ service: "cards", method: "GET", path: `/account/${userId}` }),

  getKycStatus: (c: TygaClient, userId: string) =>
    c.request<{ status: string }>({ service: "cards", method: "GET", path: `/account/${userId}/kyc-status` }),

  orderCards: (c: TygaClient, userId: string, body: { virtual_card?: number; physical_card?: number; walletType?: string }) =>
    c.request<{ orderId: string; cards: Card[] }>({ service: "cards", method: "POST", path: `/cards/${userId}/order`, body }),

  orderSingleCard: (c: TygaClient, userId: string, body: { cardType: "virtual_card" | "physical_card"; walletType?: string }) =>
    c.request<{ orderId: string; card: Card }>({ service: "cards", method: "POST", path: `/cards/${userId}/order-single`, body }),

  loadCard: (c: TygaClient, userId: string, cardId: string, body: { amount: number; externalTransactionId: string; walletType?: string }) =>
    c.request<{ transactionId: string; status: string }>({ service: "cards", method: "POST", path: `/cards/${userId}/${cardId}/load`, body }),

  lockCard: (c: TygaClient, userId: string, cardId: string) =>
    c.request<Card>({ service: "cards", method: "POST", path: `/cards/${userId}/${cardId}/lock`, body: {} }),

  unlockCard: (c: TygaClient, userId: string, cardId: string) =>
    c.request<Card>({ service: "cards", method: "POST", path: `/cards/${userId}/${cardId}/unlock`, body: {} }),

  activateCard: (c: TygaClient, userId: string, cardId: string) =>
    c.request<Card>({ service: "cards", method: "POST", path: `/cards/${userId}/${cardId}/activate`, body: {} }),

  getCardCredentials: (c: TygaClient, userId: string, cardId: string) =>
    c.request<{ pan: string; cvv: string; expiry: string }>({
      service: "cards",
      method: "GET",
      path: `/cards/${userId}/${cardId}/credentials`,
    }),

  syncCardAccount: (c: TygaClient, userId: string) =>
    c.request<CardAccount>({ service: "cards", method: "POST", path: `/cards/${userId}/sync`, body: {} }),

  getOrderQuoteMulti: (c: TygaClient, userId: string, query: { walletType: string; physical_card?: number; virtual_card?: number }) =>
    c.request<{ total: number; breakdown: Record<string, unknown> }>({
      service: "cards",
      method: "GET",
      path: `/cards/${userId}/order/quote`,
      query,
    }),

  getOrderQuoteSingle: (c: TygaClient, userId: string, query: { walletType: string; cardType: string }) =>
    c.request<{ total: number; breakdown: Record<string, unknown> }>({
      service: "cards",
      method: "GET",
      path: `/cards/${userId}/order-single/quote`,
      query,
    }),

  sendOtp: (c: TygaClient, userId: string) =>
    c.request<{ otpId: string; expiresAt: string }>({
      service: "cards",
      method: "POST",
      path: `/otp/${userId}/send`,
      body: {},
    }),

  getCardTransaction: (c: TygaClient, userId: string, transactionId: string) =>
    c.request<Record<string, unknown>>({
      service: "cards",
      method: "GET",
      path: `/transactions/${userId}/${transactionId}`,
    }),
};
