import type { TygaClient } from "../client.js";

export interface SwapEstimate {
  from: string;
  to: string;
  fromAmount: number;
  toAmount: number;
  rate: number;
  fee?: number;
  quoteId?: string;
  expiresAt?: string;
}

export interface CustodialWallet {
  walletId: string;
  userId: string;
  asset: string;
  address: string;
  balance: number;
  network?: string;
}

export const cryptoApi = {
  estimateSwap: (c: TygaClient, body: { from: string; to: string; fromAmount?: number; toAmount?: number; userId: string }) =>
    c.request<SwapEstimate>({ service: "crypto", method: "POST", path: "/swaps/external/estimate", body }),

  createSwap: (c: TygaClient, body: { quoteId?: string; from: string; to: string; amount: number; userId: string; otp?: string }) =>
    c.request<{ transactionId: string; status: string }>({
      service: "crypto", method: "POST", path: "/swaps/external", body,
    }),

  getSwapStatus: (c: TygaClient, userId: string, transactionId: string) =>
    c.request<{ status: string; transactionId: string; [k: string]: unknown }>({
      service: "crypto", method: "GET", path: `/swaps/external/${userId}/${transactionId}`,
    }),

  sendOtp: (c: TygaClient, userId: string) =>
    c.request<{ otpId: string; expiresAt: string }>({
      service: "crypto", method: "POST", path: `/otp/${userId}/send`, body: {},
    }),

  createCustodialWallet: (c: TygaClient, body: { userId: string; asset: string }) =>
    c.request<CustodialWallet>({
      service: "crypto", method: "POST", path: "/wallets/custodial/create", body,
    }),

  sendCustodialCrypto: (c: TygaClient, body: {
    userId: string; asset: string; amount: number; destinationAddress: string; destinationTag?: string; otp?: string;
  }) => c.request<{ transactionId: string; status: string }>({
    service: "crypto", method: "POST", path: "/wallets/custodial/send", body,
  }),

  getCustodialWallet: (c: TygaClient, userId: string, asset: string) =>
    c.request<CustodialWallet>({
      service: "crypto", method: "GET", path: `/wallets/custodial/${userId}/${asset}`,
    }),

  listCustodialWallets: (c: TygaClient, userId: string) =>
    c.request<CustodialWallet[]>({
      service: "crypto", method: "GET", path: `/wallets/custodial/${userId}`,
    }),
};
