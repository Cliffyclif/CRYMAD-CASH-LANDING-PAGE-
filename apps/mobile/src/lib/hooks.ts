import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "./api";

export interface SessionInfo {
  authenticated: boolean;
  session?: { userId: string; email?: string };
  user?: Record<string, unknown>;
}

export function useMe() {
  return useQuery({ queryKey: ["me"], queryFn: () => api<SessionInfo>("/auth/me") });
}
export function useLogin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { email: string }) =>
      api("/auth/login", { method: "POST", body: JSON.stringify(body) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["me"] }),
  });
}
export function useLogout() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api("/auth/logout", { method: "POST" }),
    onSuccess: () => qc.clear(),
  });
}

export interface DashboardSummary {
  user: Record<string, unknown> | null;
  wallets: Array<{ walletId: string; walletType: string; currency: string; balance: number }>;
  recentTransactions: Array<{
    transactionId: string; amount: number; currency: string; status: string; type?: string;
  }>;
  tenantWallets: Array<{ walletType: string; currency: string; balance: number }>;
  errors: Record<string, string | undefined>;
}

export function useDashboard() {
  return useQuery({ queryKey: ["dashboard", "summary"], queryFn: () => api<DashboardSummary>("/dashboard/summary") });
}
