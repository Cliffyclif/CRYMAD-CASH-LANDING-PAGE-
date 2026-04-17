import type { TygaClient } from "../client.js";

export interface Order {
  orderId: string;
  orderNumber: string;
  status: "pending" | "success" | "cancelled" | "expired" | string;
  amount: number;
  currency: string;
  gatewayUrl?: string;
  createdAt?: string;
  [k: string]: unknown;
}

export interface Subscription {
  subscriptionId: string;
  status: string;
  nextChargeAt?: string;
  amount: number;
  currency: string;
  [k: string]: unknown;
}

export const ordersApi = {
  createOrder: (c: TygaClient, body: {
    orderType?: "payment" | "deposit";
    amount: number;
    currency: string;
    externalOrderId?: string;
    customerInformation?: Record<string, unknown>;
    notifyUrl?: string;
    returnUrl?: string;
    [k: string]: unknown;
  }) => c.request<Order>({ service: "orders", method: "POST", path: "", body }),

  getOrder: (c: TygaClient, orderId: string) =>
    c.request<Order>({ service: "orders", method: "GET", path: `/${orderId}` }),

  cancelOrder: (c: TygaClient, orderId: string) =>
    c.request<Order>({ service: "orders", method: "PUT", path: `/${orderId}/cancel`, body: {} }),

  refundOrder: (c: TygaClient, orderId: string, body: { amount?: number; reason?: string }) =>
    c.request<Order>({ service: "orders", method: "POST", path: `/${orderId}/refund`, body }),

  createSubscription: (c: TygaClient, body: Record<string, unknown>) =>
    c.request<Subscription>({ service: "orders", method: "POST", path: "/subscriptions", body }),

  getSubscription: (c: TygaClient, subscriptionId: string) =>
    c.request<Subscription>({ service: "orders", method: "GET", path: `/subscriptions/${subscriptionId}` }),

  cancelSubscription: (c: TygaClient, subscriptionId: string) =>
    c.request<Subscription>({ service: "orders", method: "POST", path: `/subscriptions/${subscriptionId}/cancel`, body: {} }),
};
