import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, ApiError } from "./api";

/* ---------- Types that mirror the dashboard API ---------- */

export interface User {
  id: string;
  email: string;
  accountType: "individual" | "business";
  tygapayUserId: string;
  firstName?: string;
  lastName?: string;
  kycStatus: "not_started" | "pending" | "approved" | "rejected";
  emailVerified: boolean;
  completedRegistration: boolean;
  phoneNumber?: string;
  dateOfBirth?: string;
  createdAt: string;
  lastLoginAt?: string | null;
}

export interface Wallet {
  id: string;
  type: "ewallet" | "crypto" | "card" | "rewards";
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

export interface Transaction {
  id: string;
  status: string;
  type: string;
  side?: "credit" | "debit";
  amount: number;
  fee?: number;
  currency?: string;
  walletType?: string;
  reference?: string;
  orderId?: string;
  txHash?: string;
  network?: string;
  confirmations?: number;
  email?: string;
  createdDate: string;
  modifiedDate?: string;
  completedDate?: string;
}

export interface MeResponse {
  user: User;
  wallets: Wallet[];
  authenticated?: boolean;
}

/* ---------- Auth ---------- */

export function useMe() {
  return useQuery<MeResponse | { authenticated: false }>({
    queryKey: ["me"],
    queryFn: async () => {
      try {
        const r = await api<MeResponse>("/api/auth/me");
        return { ...r, authenticated: true } as MeResponse & { authenticated: true };
      } catch (e) {
        if (e instanceof ApiError && e.status === 401) return { authenticated: false };
        throw e;
      }
    },
    staleTime: 30_000,
    retry: false,
  });
}

export function useLogin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { email: string; password: string }) =>
      api<{ requires2fa?: boolean; user?: User }>("/api/auth/login", {
        method: "POST",
        body,
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["me"] }),
  });
}

export function useRegister() {
  return useMutation({
    mutationFn: (body: { email: string; password: string; accountType?: "individual" | "business" }) =>
      api<{ userId: string; email: string; tygaVerifySent?: boolean }>("/api/auth/register", {
        method: "POST",
        body,
      }),
  });
}

export function useLogout() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api("/api/auth/logout", { method: "POST" }),
    onSuccess: () => qc.clear(),
  });
}

export function useVerifyOtp() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { email: string; code: string; purpose: "login" | "register" | "email_verify" }) =>
      api("/api/auth/verify-otp", { method: "POST", body }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["me"] }),
  });
}

export function useSendOtp() {
  return useMutation({
    mutationFn: (body: { email: string; purpose: "login" | "register" | "reset" }) =>
      api("/api/auth/send-otp", { method: "POST", body }),
  });
}

export function useResendVerify() {
  return useMutation({
    mutationFn: (body: { email: string }) =>
      api<{ tygaSent: boolean; tygaError?: unknown }>("/api/auth/resend-verify", {
        method: "POST",
        body,
      }),
  });
}

export function useResetPassword() {
  return useMutation({
    mutationFn: (body: { email: string; code: string; newPassword: string }) =>
      api("/api/auth/reset-password", { method: "POST", body }),
  });
}

/* ---------- Transactions ---------- */

export interface TransactionsQuery {
  walletType?: "ewallet" | "crypto" | "card" | "rewards";
  type?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
}

export function useTransactions(q: TransactionsQuery = {}) {
  return useQuery({
    queryKey: ["transactions", q],
    queryFn: () =>
      api<{ transactions: Transaction[] }>("/api/transactions", { query: q as Record<string, string | number | undefined> })
        .then((r) => r.transactions ?? []),
    staleTime: 30_000,
  });
}

/* ---------- Crypto ---------- */

export interface CryptoWallet {
  token: string;
  balance: number;
  address?: string;
  network?: string;
}

export interface CryptoDepositAddress {
  asset?: string;
  network?: string;
  address: string;
  tag?: string;
  supportedTokens?: string[];
}

export interface MarketPrice {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  sparkline?: number[];
}

export function useCryptoWallets() {
  return useQuery({
    queryKey: ["crypto", "wallets"],
    queryFn: () => api<{ wallets: CryptoWallet[] }>("/api/crypto/wallets").then((r) => r.wallets ?? []),
    staleTime: 30_000,
  });
}

export function useCryptoDepositAddresses() {
  return useQuery({
    queryKey: ["crypto", "deposit-addresses"],
    queryFn: () => api<{ addresses: CryptoDepositAddress[] }>("/api/crypto/deposit-addresses").then((r) => r.addresses ?? []),
    staleTime: 5 * 60_000,
  });
}

export function useMarketPrices() {
  return useQuery({
    queryKey: ["market", "prices"],
    queryFn: () => api<{ prices: Record<string, MarketPrice> }>("/api/market/prices").then((r) => r.prices ?? {}),
    staleTime: 60_000,
  });
}

export function useCryptoSend() {
  return useMutation({
    mutationFn: (body: { token: string; amount: number; toAddress: string; otp: string }) =>
      api("/api/crypto/send", { method: "POST", body }),
  });
}

export function useCryptoSwap() {
  return useMutation({
    mutationFn: (body: { amount: number; toCurrency: string; toAddress: string; otp: string }) =>
      api("/api/crypto/swap", { method: "POST", body }),
  });
}

export function useCryptoSwapEstimate() {
  return useMutation({
    mutationFn: (body: { fromCurrency: string; toCurrency: string; amount: number }) =>
      api<{ estimate: { toAmount?: number; amount?: number } }>("/api/crypto/swap-estimate", {
        method: "POST",
        body,
      }),
  });
}

export function useCryptoSendOtp() {
  return useMutation({
    mutationFn: () => api("/api/crypto/send-otp", { method: "POST", body: {} }),
  });
}

/* ---------- E-Wallet ---------- */

export function useEwalletTransfer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { toEmail?: string; toPhone?: string; amount: number; description?: string }) =>
      api("/api/ewallet/transfer", { method: "POST", body }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["me"] }),
  });
}

/* ---------- Cards ---------- */

export interface CardAccount {
  cards?: Array<{
    cardId?: string;
    id?: string;
    last4?: string;
    maskedNumber?: string;
    type?: string;
    cardType?: string;
    status?: string;
    balance?: number;
    currency?: string;
    expiryDate?: string;
    expiry?: string;
  }>;
  kycStatus?: string;
  accountId?: string;
}

export function useCardAccount() {
  return useQuery({
    queryKey: ["cards", "account"],
    queryFn: () => api<{ account: CardAccount | null }>("/api/cards/account").then((r) => r.account),
    staleTime: 30_000,
  });
}

export function useCardSendOtp() {
  return useMutation({
    mutationFn: (body: { type: "order" | "load" | "credentials"; walletType?: string }) =>
      api("/api/cards/send-otp", { method: "POST", body }),
  });
}

export function useCardOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { cardType: string; walletType: string; otp: string }) =>
      api<{ order: { orderId?: string; id?: string } }>("/api/cards/order", { method: "POST", body }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cards"] }),
  });
}

export function useCardLoad() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (args: { cardId: string; amount: number; walletType: string; otp: string }) =>
      api(`/api/cards/${args.cardId}/load`, { method: "POST", body: args }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cards"] }),
  });
}

export function useCardLock() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (args: { cardId: string; reason?: string }) =>
      api(`/api/cards/${args.cardId}/lock`, { method: "POST", body: { reason: args.reason } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cards"] }),
  });
}

export function useCardUnlock() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (args: { cardId: string; reason?: string }) =>
      api(`/api/cards/${args.cardId}/unlock`, { method: "POST", body: { reason: args.reason } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cards"] }),
  });
}

export function useCardCredentials() {
  return useMutation({
    mutationFn: (args: { cardId: string; otp: string }) =>
      api<{ credentials: { cardNumber?: string; cvv?: string; expiryDate?: string } }>(
        `/api/cards/${args.cardId}/credentials`,
        { method: "POST", body: { otp: args.otp } },
      ),
  });
}

/* ---------- Beneficiaries ---------- */

export interface Beneficiary {
  id: string;
  nickname?: string;
  fullName: string;
  bankName: string;
  accountNumberMasked: string;
  swiftBic?: string;
  iban?: string;
  currency: string;
  country: string;
  createdAt?: string;
}

export function useBeneficiaries() {
  return useQuery({
    queryKey: ["beneficiaries"],
    queryFn: () => api<{ beneficiaries: Beneficiary[] }>("/api/beneficiaries").then((r) => r.beneficiaries ?? []),
    staleTime: 60_000,
  });
}

export function useAddBeneficiary() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: {
      fullName: string; bankName: string; accountNumber: string;
      swiftBic?: string; currency: string; country: string;
      nickname?: string;
    }) => api("/api/beneficiaries", { method: "POST", body }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["beneficiaries"] }),
  });
}

export function useDeleteBeneficiary() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api(`/api/beneficiaries/${id}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["beneficiaries"] }),
  });
}

/* ---------- Notifications ---------- */

export interface NotificationRow {
  id: string; kind: string; title: string; body: string;
  link: string | null; read_at: string | null; created_at: string;
}

export function useNotifications() {
  return useQuery({
    queryKey: ["notifications"],
    queryFn: () =>
      api<{ notifications: NotificationRow[]; unreadCount?: number }>("/api/notifications", { query: { limit: 50 } }),
    staleTime: 30_000,
  });
}

/* ---------- Payouts + Subscriptions + Recurring ---------- */

export interface Payout {
  id: string;
  status: string;
  amount: number;
  fee?: number;
  currency?: string;
  createdDate?: string;
  beneficiary?: { fullName?: string; bankName?: string };
  [key: string]: unknown;
}

export function usePayouts() {
  return useQuery({
    queryKey: ["payouts"],
    queryFn: () => api<{ transactions: Payout[] }>("/api/payouts"),
    staleTime: 30_000,
  });
}

export interface Subscription {
  id: string;
  status: string;
  amount: number;
  currency?: string;
  interval?: string;
  nextBillingDate?: string;
  [key: string]: unknown;
}

// No list endpoint on dashboard yet — keep the hook shape ready for when one lands.
export function useSubscriptions() {
  return useQuery({
    queryKey: ["subscriptions"],
    queryFn: async () => ({ subscriptions: [] as Subscription[] }),
    staleTime: 60_000,
  });
}

export interface RecurringPayment {
  id: string;
  status: string;
  amount: number;
  currency?: string;
  interval?: string;
  nextRunAt?: string;
  [key: string]: unknown;
}

export function useRecurringPayments() {
  return useQuery({
    queryKey: ["recurring-payments"],
    queryFn: () => api<{ payments: RecurringPayment[] }>("/api/recurring-payments"),
    staleTime: 60_000,
  });
}

/* ---------- Profile completion + KYC ---------- */

export interface CompleteRegistrationInput {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  phoneNumber: string;
  languageCode?: string;
  address: {
    addressLine1: string;
    addressLine2?: string;
    city: string;
    subdivision: string;
    postalCode: string;
    country: string;
  };
}

export function useCompleteRegistration() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CompleteRegistrationInput) =>
      api("/api/user/complete-registration", { method: "POST", body }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["me"] }),
  });
}

export function useKycSession() {
  return useMutation({
    mutationFn: () =>
      api<{ sessionUrl?: string; session?: { sessionUrl?: string; url?: string } }>(
        "/api/user/kyc-session",
        { method: "POST" },
      ),
  });
}

/* ---------- Format helpers ---------- */

export function formatMoney(amount: number, currency = "USD"): string {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency", currency,
      minimumFractionDigits: 2, maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(2)}`;
  }
}

export function formatCrypto(amount: number, symbol: string, decimals = 6): string {
  return `${amount.toFixed(decimals)} ${symbol}`;
}
