import nodemailer, { Transporter } from "nodemailer";
import path from "node:path";

const FROM = process.env.EMAIL_FROM || "Crymad Cash <support@crymadcash.com>";
const LOGO_CID = "crymad-logo";
const LOGO_PATH = path.join(process.cwd(), "public", "icon-192.png");

let _transport: Transporter | null = null;
function transport(): Transporter | null {
  if (_transport) return _transport;
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!host || !user || !pass) return null;
  const port = Number(process.env.SMTP_PORT || 587);
  _transport = nodemailer.createTransport({
    host,
    port,
    secure: port === 465, // true for 465, false for 587 (STARTTLS)
    auth: { user, pass },
  });
  return _transport;
}

export interface SendResult {
  ok: boolean;
  id?: string;
  error?: string;
}

export async function sendEmail(args: {
  to: string;
  subject: string;
  html: string;
  text: string;
  embedLogo?: boolean;
}): Promise<SendResult> {
  const t = transport();
  if (!t) return { ok: false, error: "SMTP not configured" };
  try {
    const info = await t.sendMail({
      from: FROM,
      to: args.to,
      subject: args.subject,
      html: args.html,
      text: args.text,
      attachments: args.embedLogo
        ? [{ filename: "logo.png", path: LOGO_PATH, cid: LOGO_CID }]
        : undefined,
    });
    return { ok: true, id: info.messageId };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "send failed" };
  }
}

/** OTP code email — branded Crymad Cash dark/emerald theme. */
export async function sendOtpEmail(args: {
  to: string;
  code: string;
  purpose: "register" | "login" | "email_verify" | "reset";
  firstName?: string;
}): Promise<SendResult> {
  const action =
    args.purpose === "register"
      ? "verify your email"
      : args.purpose === "login"
        ? "sign in"
        : args.purpose === "reset"
          ? "reset your password"
          : "verify your email";

  const subject =
    args.purpose === "login"
      ? `${args.code} is your Crymad Cash sign-in code`
      : args.purpose === "reset"
        ? `${args.code} is your Crymad Cash password reset code`
        : `${args.code} is your Crymad Cash verification code`;

  const greeting = args.firstName ? `Hi ${args.firstName},` : "Hi there,";

  const html = renderOtpHtml({ code: args.code, action, greeting });
  const text = renderOtpText({ code: args.code, action, greeting });

  return sendEmail({ to: args.to, subject, html, text, embedLogo: true });
}

function renderOtpHtml(args: { code: string; action: string; greeting: string }) {
  const codeBoxes = args.code
    .split("")
    .map(
      (d) => `<td align="center" style="
        width:48px;height:56px;
        font-family:'Courier New',monospace;
        font-size:28px;font-weight:700;
        color:#10b981;
        background:#0a1612;
        border:1px solid rgba(16,185,129,0.3);
        border-radius:8px;
      ">${d}</td>`,
    )
    .join('<td style="width:8px"></td>');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>Crymad Cash verification code</title>
</head>
<body style="margin:0;padding:0;background:#040d0a;font-family:-apple-system,'Segoe UI',Roboto,sans-serif;color:#e6f0ec;">
  <div style="display:none;max-height:0;overflow:hidden">Your Crymad Cash code is ${args.code}. It expires in 10 minutes.</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#040d0a;padding:40px 20px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:linear-gradient(180deg,#0a1612 0%,#06100c 100%);border:1px solid rgba(16,185,129,0.18);border-radius:20px;overflow:hidden;">
        <tr><td style="padding:32px 32px 8px 32px;text-align:center;">
          <img src="cid:${LOGO_CID}" alt="Crymad Cash" width="56" height="56" style="display:inline-block;border-radius:14px;margin-bottom:12px;" />
          <div style="font-size:18px;font-weight:800;letter-spacing:1.5px;color:#10b981;text-shadow:0 0 20px rgba(16,185,129,0.4);">CRYMAD CA$H</div>
        </td></tr>

        <tr><td style="padding:24px 40px 8px 40px;">
          <h1 style="margin:0 0 12px;font-size:22px;font-weight:700;color:#ffffff;letter-spacing:-0.3px;">Verification code</h1>
          <p style="margin:0 0 4px;font-size:15px;line-height:1.6;color:#b8c8c2;">${args.greeting}</p>
          <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#b8c8c2;">Use the code below to ${args.action}. It expires in 10 minutes.</p>
        </td></tr>

        <tr><td style="padding:0 40px 8px 40px;" align="center">
          <table role="presentation" cellpadding="0" cellspacing="0">
            <tr>${codeBoxes}</tr>
          </table>
        </td></tr>

        <tr><td style="padding:24px 40px 8px 40px;">
          <p style="margin:16px 0 0;font-size:13px;line-height:1.6;color:#7a8a85;">
            Didn't request this? You can safely ignore this email — no changes were made to your account.
          </p>
        </td></tr>

        <tr><td style="padding:32px 40px 32px 40px;border-top:1px solid rgba(16,185,129,0.1);margin-top:24px;">
          <p style="margin:0;font-size:12px;line-height:1.5;color:#5a6a65;text-align:center;">
            Crymad Cash · Digital Finance Platform<br/>
            This is an automated message, please do not reply.
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function renderOtpText(args: { code: string; action: string; greeting: string }) {
  return `CRYMAD CA$H — Verification code

${args.greeting}

Use this code to ${args.action}:

    ${args.code}

The code expires in 10 minutes.

Didn't request this? You can safely ignore this email — no changes were made to your account.

— Crymad Cash`;
}
