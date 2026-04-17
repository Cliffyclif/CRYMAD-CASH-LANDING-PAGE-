import type { TygaClient } from "../client.js";

export const authApi = {
  clientToken: (c: TygaClient, body: { userId?: string; email?: string; externalUserId?: string }) =>
    c.request<{ token: string; expiresAt?: string; userId?: string }>({
      service: "auth",
      method: "POST",
      path: "/client-token",
      body,
    }),
};
