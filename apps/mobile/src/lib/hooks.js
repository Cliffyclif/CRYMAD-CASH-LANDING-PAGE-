import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "./api";
export function useMe() {
    return useQuery({ queryKey: ["me"], queryFn: () => api("/auth/me") });
}
export function useLogin() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (body) => api("/auth/login", { method: "POST", body: JSON.stringify(body) }),
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
export function useDashboard() {
    return useQuery({ queryKey: ["dashboard", "summary"], queryFn: () => api("/dashboard/summary") });
}
