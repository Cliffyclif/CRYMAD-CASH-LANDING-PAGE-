export interface TygaConfig {
  apiKey: string;
  apiSecret: string;
  tenantId: string;
  urls: {
    users: string;
    transactions: string;
    orders: string;
    tenants: string;
    cards: string;
    crypto: string;
    auth: string;
    rewards: string;
    reporting: string;
  };
}

export type ServiceName = keyof TygaConfig["urls"];

export interface TygaError {
  status: number;
  code?: string;
  message: string;
  raw?: unknown;
}
