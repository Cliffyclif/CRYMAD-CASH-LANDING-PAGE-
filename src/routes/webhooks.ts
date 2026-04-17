import { Hono } from "hono";
import { randomUUID } from "node:crypto";
import { db } from "../db.js";
import { webhookEvents, notifications, auditEvents } from "../schema.js";

export const webhookRoutes = new Hono();

webhookRoutes.post("/tygapay", async (c) => {
  const raw = await c.req.text();
  let payload: Record<string, unknown> = {};
  try {
    payload = JSON.parse(raw);
  } catch {
    return c.json({ error: "invalid json" }, 400);
  }

  const eventType = (payload.type as string) ?? "unknown";
  const now = Date.now();
  const id = randomUUID();

  db.insert(webhookEvents)
    .values({
      id,
      source: "tygapay",
      eventType,
      payload: raw,
      receivedAt: now,
    })
    .run();

  db.insert(auditEvents)
    .values({
      id: randomUUID(),
      actorUserId: null,
      eventType: `webhook.${eventType}`,
      payload: raw,
      createdAt: now,
    })
    .run();

  // Fan out to notification feed for affected user
  const userId =
    (payload.userId as string | undefined) ??
    ((payload.user as { id?: string } | undefined)?.id);
  if (userId) {
    const title =
      eventType === "payout" ? "Payout processed" :
      eventType === "order" ? "Order update" :
      "Activity update";
    db.insert(notifications)
      .values({
        id: randomUUID(),
        userId,
        type: eventType,
        title,
        body: `TygaPay event: ${eventType}`,
        link: null,
        createdAt: now,
      })
      .run();
  }

  return c.json({ ok: true, id });
});
