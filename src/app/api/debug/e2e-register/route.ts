/**
 * POST /api/debug/e2e-register
 * Gated by DEBUG_KEY env var. Runs the full register → verify → complete
 * flow end-to-end using info@crymadcash.com (IMAP) to read the TygaBank
 * verification code. Returns a trace so we can diagnose where the pipeline
 * breaks without needing an out-of-band inbox.
 */

import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import crypto from "node:crypto";
import { ImapFlow } from "imapflow";
import { simpleParser } from "mailparser";
import { query, queryOne } from "@/lib/db";
import { tyga, TygaBankError } from "@/lib/tygabank/client";

type Trace = Array<{ step: string; ok: boolean; data?: unknown; err?: unknown }>;

function add(trace: Trace, step: string, ok: boolean, data?: unknown, err?: unknown) {
  const entry: Trace[number] = { step, ok };
  if (data !== undefined) entry.data = data;
  if (err !== undefined) {
    entry.err = err instanceof TygaBankError
      ? { status: err.status, body: err.body }
      : err instanceof Error
        ? { message: err.message }
        : err;
  }
  trace.push(entry);
}

async function readCodeFromInbox(
  email: string,
  sinceMs: number,
  timeoutMs = 60000,
): Promise<{ code: string | null; probed: number; subjects: string[]; folders: string[]; usedFolder: string }> {
  const host = process.env.IMAP_HOST || "mail.infomaniak.com";
  const port = Number(process.env.IMAP_PORT || 993);
  const user = process.env.IMAP_USER || process.env.SMTP_USER;
  const pass = process.env.IMAP_PASS || process.env.SMTP_PASS;
  if (!user || !pass) throw new Error("IMAP credentials not configured");

  // Plus-addressing: everything after '+' is routing hint; envelope.to may or
  // may not preserve it depending on the mail server. Match loosely.
  const localPart = email.split("@")[0].split("+")[0].toLowerCase();

  const deadline = Date.now() + timeoutMs;
  let probed = 0;
  const subjects: string[] = [];
  let folderList: string[] = [];
  let usedFolder = "INBOX";

  // Inspect folder layout once at start.
  try {
    const c0 = new ImapFlow({ host, port, secure: true, auth: { user, pass }, logger: false });
    await c0.connect();
    const list = await c0.list();
    folderList = list.map((m) => m.path);
    await c0.logout();
  } catch { /* noop */ }

  while (Date.now() < deadline) {
    const client = new ImapFlow({
      host, port, secure: true, auth: { user, pass }, logger: false,
    });
    try {
      await client.connect();
      // Prefer INBOX; some servers route plus-addressed to Junk/Spam.
      const candidates = ["INBOX", ...folderList.filter((f) => /junk|spam|all/i.test(f))];
      for (const folder of candidates) {
        usedFolder = folder;
        let lock;
        try { lock = await client.getMailboxLock(folder); } catch { continue; }
        try {
          // Search the LAST 50 messages regardless of time, so we see truly
          // what's in the inbox (avoids missed-window issues).
          const box = client.mailbox;
          const exists = typeof box === "object" && box ? (box as { exists?: number }).exists ?? 0 : 0;
          const from = Math.max(1, exists - 50);
          if (exists === 0) continue;
          for await (const msg of client.fetch(
            `${from}:*`,
            { envelope: true, source: true },
          )) {
          probed += 1;
          if (!msg.source) continue;
          const parsed = await simpleParser(msg.source);
          const subj = (parsed.subject || "").slice(0, 120);
          const fromText = parsed.from ? JSON.stringify(parsed.from).toLowerCase() : "";
          subjects.push(`[${folder}] ${fromText.slice(0, 60)} :: ${subj}`);
          const toText = (parsed.to ? (Array.isArray(parsed.to) ? parsed.to : [parsed.to]).map((a) => JSON.stringify(a)).join(",") : "").toLowerCase();
          const matchesRecipient =
            toText.includes(email.toLowerCase()) || toText.includes(localPart);
          const subjectHit = /verif|confirm|crymad|tyga|crmdx|activation|one[- ]?time|otp/i.test(subj);
          const fromHit = /tyga|crmdx|no[- ]?reply/i.test(fromText);
          // Require BOTH: recipient match AND verify-like signature — avoids
          // picking up random 6-digit numbers from marketing mail.
          if (!matchesRecipient || !(subjectHit || fromHit)) continue;
          const hay = `${parsed.text || ""}\n${(parsed.html as string) || ""}\n${subj}`;
          const m = hay.match(/\b(\d{6})\b/);
          if (m) {
            return { code: m[1], probed, subjects, folders: folderList, usedFolder };
          }
        }
        } finally {
          lock.release();
        }
      }
    } finally {
      try { await client.logout(); } catch { /* noop */ }
    }
    await new Promise((r) => setTimeout(r, 2500));
  }
  return { code: null, probed, subjects, folders: folderList, usedFolder };
}

// Hardcoded gate key for a one-shot diagnostic run. The route will be
// deleted after the test pipeline is verified.
const DEBUG_KEY = "2EEitrDGI0ue60S26UZ_tgJkITe5QxCg";

export async function POST(req: NextRequest) {
  const key = req.headers.get("x-debug-key");
  if (key !== DEBUG_KEY) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  const trace: Trace = [];
  const startedAt = Date.now();
  const testEmail = `info+e2e${Date.now()}@crymadcash.com`;
  const password = "E2eTest123!";

  try {
    // 1. Register via TygaBank directly (skip our /api/auth/register to avoid
    //    extra noise — this tests the TygaBank pipeline end-to-end).
    const externalId = `crmdx_${testEmail.replace(/[^a-z0-9]/g, "_")}`;
    let tygaUser;
    try {
      tygaUser = await tyga.users.create({
        email: testEmail,
        externalUserId: externalId,
        firstName: "E2E",
        lastName: "Tester",
        createdBy: "crmdx-e2e",
        sendWelcomeEmail: false,
        autoVerifyEmail: true,
        type: "individual",
      });
      add(trace, "tyga.users.create", true, tygaUser);
    } catch (e) {
      add(trace, "tyga.users.create", false, undefined, e);
      return NextResponse.json({ ok: false, trace, testEmail }, { status: 500 });
    }

    const tygaId = String(
      (tygaUser as { id?: string; userId?: string }).id ??
        (tygaUser as { userId?: string }).userId ??
        "",
    );
    if (!tygaId) {
      add(trace, "normalize-tid", false);
      return NextResponse.json({ ok: false, trace, testEmail }, { status: 500 });
    }

    // 2. Insert local row
    const passwordHash = await bcrypt.hash(password, 12);
    try {
      await query(
        `INSERT INTO users (email, password_hash, tygapay_user_id, external_id, account_type)
           VALUES ($1, $2, $3, $4, $5)`,
        [testEmail, passwordHash, tygaId, externalId, "individual"],
      );
      add(trace, "db.insert-user", true);
    } catch (e) {
      add(trace, "db.insert-user", false, undefined, e);
    }

    // 3. Check emailIsVerified NOW (is autoVerifyEmail honored?)
    try {
      const u = await tyga.users.getById(tygaId);
      add(trace, "tyga.getById-after-create", true, {
        emailIsVerified: u.emailIsVerified,
        completedRegistration: u.completedRegistration,
      });
    } catch (e) {
      add(trace, "tyga.getById-after-create", false, undefined, e);
    }

    // 4. sendVerifyEmail
    try {
      const r = await tyga.users.sendVerifyEmail(tygaId);
      add(trace, "tyga.sendVerifyEmail", true, r);
    } catch (e) {
      add(trace, "tyga.sendVerifyEmail", false, undefined, e);
    }

    // 5. Poll IMAP for code
    let code: string | null = null;
    try {
      const result = await readCodeFromInbox(testEmail, startedAt, 90_000);
      code = result.code;
      add(trace, "imap.readCode", !!code, result);
    } catch (e) {
      add(trace, "imap.readCode", false, undefined, e);
    }

    // 6. confirmVerifyEmail with the real code
    if (code) {
      try {
        const r = await tyga.users.confirmVerifyEmail(tygaId, code);
        add(trace, "tyga.confirmVerifyEmail", true, r);
      } catch (e) {
        add(trace, "tyga.confirmVerifyEmail", false, undefined, e);
      }
    } else {
      // Fallback: try admin-trusted no-code confirm
      try {
        const r = await tyga.users.confirmVerifyEmail(tygaId);
        add(trace, "tyga.confirmVerifyEmail-no-code", true, r);
      } catch (e) {
        add(trace, "tyga.confirmVerifyEmail-no-code", false, undefined, e);
      }
    }

    // 7. Check emailIsVerified AFTER confirm
    try {
      const u = await tyga.users.getById(tygaId);
      add(trace, "tyga.getById-after-confirm", true, {
        emailIsVerified: u.emailIsVerified,
      });
    } catch (e) {
      add(trace, "tyga.getById-after-confirm", false, undefined, e);
    }

    // 8. complete-registration
    try {
      const r = await tyga.users.update(tygaId, {
        firstName: "E2E",
        lastName: "Tester",
        dateOfBirth: "1990-01-15",
        phoneNumber: "+15555550100",
        languageCode: "en",
        address: {
          addressLine1: "1 Test Street",
          city: "San Francisco",
          subdivision: "CA",
          postalCode: "94102",
          country: "US",
        },
      });
      add(trace, "tyga.users.update", true, r);
    } catch (e) {
      add(trace, "tyga.users.update", false, undefined, e);
    }

    // 9. autoprovision crypto wallet
    try {
      await tyga.users.createCryptoWallet(tygaId);
      add(trace, "tyga.createCryptoWallet", true);
    } catch (e) {
      add(trace, "tyga.createCryptoWallet", false, undefined, e);
    }

    const successSteps = trace.filter((t) => t.ok).length;
    const totalSteps = trace.length;
    return NextResponse.json({
      ok: successSteps === totalSteps,
      successSteps,
      totalSteps,
      testEmail,
      tygaId,
      trace,
    });
  } catch (err) {
    return NextResponse.json({
      ok: false,
      error: (err as Error).message,
      stack: (err as Error).stack?.split("\n").slice(0, 6).join("\n"),
      trace,
    }, { status: 500 });
  } finally {
    // Cleanup local row so we can re-run
    try {
      await queryOne(`DELETE FROM users WHERE email = $1 RETURNING id`, [testEmail]);
    } catch { /* noop */ }
  }
}
