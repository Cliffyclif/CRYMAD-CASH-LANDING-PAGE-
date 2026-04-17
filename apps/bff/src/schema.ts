import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";

export const sessions = sqliteTable("sessions", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  tygaClientToken: text("tyga_client_token"),
  email: text("email"),
  createdAt: integer("created_at").notNull(),
  expiresAt: integer("expires_at").notNull(),
});

export const beneficiaries = sqliteTable("beneficiaries", {
  id: text("id").primaryKey(),
  ownerUserId: text("owner_user_id").notNull(),
  linkedUserId: text("linked_user_id"),
  nickname: text("nickname").notNull(),
  avatarUrl: text("avatar_url"),
  address: text("address"),
  currency: text("currency"),
  kind: text("kind").notNull(),
  createdAt: integer("created_at").notNull(),
});

export const notifications = sqliteTable("notifications", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  type: text("type").notNull(),
  title: text("title").notNull(),
  body: text("body").notNull(),
  link: text("link"),
  readAt: integer("read_at"),
  createdAt: integer("created_at").notNull(),
});

export const notificationPrefs = sqliteTable("notification_prefs", {
  userId: text("user_id").primaryKey(),
  email: integer("email").notNull().default(1),
  push: integer("push").notNull().default(1),
  sms: integer("sms").notNull().default(0),
  categories: text("categories"),
});

export const teamRoles = sqliteTable("team_roles", {
  userId: text("user_id").primaryKey(),
  role: text("role").notNull(),
  permissions: text("permissions"),
  createdAt: integer("created_at").notNull(),
});

export const counterpartyLimits = sqliteTable("counterparty_limits", {
  id: text("id").primaryKey(),
  counterpartyId: text("counterparty_id").notNull(),
  dailyLimit: real("daily_limit").notNull(),
  monthlyLimit: real("monthly_limit"),
  exposure: real("exposure").notNull().default(0),
  updatedAt: integer("updated_at").notNull(),
});

export const auditEvents = sqliteTable("audit_events", {
  id: text("id").primaryKey(),
  actorUserId: text("actor_user_id"),
  eventType: text("event_type").notNull(),
  payload: text("payload").notNull(),
  createdAt: integer("created_at").notNull(),
});

export const webhookEvents = sqliteTable("webhook_events", {
  id: text("id").primaryKey(),
  source: text("source").notNull(),
  eventType: text("event_type").notNull(),
  payload: text("payload").notNull(),
  processedAt: integer("processed_at"),
  receivedAt: integer("received_at").notNull(),
});

export const recurringSchedules = sqliteTable("recurring_schedules", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  tygaRecurringId: text("tyga_recurring_id"),
  nickname: text("nickname").notNull(),
  amount: real("amount").notNull(),
  currency: text("currency").notNull(),
  frequency: text("frequency").notNull(),
  nextRunAt: integer("next_run_at"),
  active: integer("active").notNull().default(1),
  createdAt: integer("created_at").notNull(),
});
