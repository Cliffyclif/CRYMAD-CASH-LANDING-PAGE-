import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

const EMAIL_MAP: Record<string, string | undefined> = {
  support: process.env.EMAIL_SUPPORT,
  business: process.env.EMAIL_BUSINESS,
  compliance: process.env.EMAIL_COMPLIANCE,
};

export async function POST(request: Request) {
  try {
    const { name, email, subject, message, channel } = await request.json();

    // Validate
    if (!name || !email || !subject || !message) {
      return NextResponse.json({ error: "All fields are required." }, { status: 400 });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
    }

    const recipient = EMAIL_MAP[channel] || EMAIL_MAP.support || "support@crymadcash.com";

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const channelLabel =
      channel === "business" ? "Business Inquiry" :
      channel === "compliance" ? "Compliance Inquiry" :
      "Support Inquiry";

    // Email to the team
    await transporter.sendMail({
      from: `"Crymad Cash Website" <${process.env.SMTP_USER}>`,
      to: recipient,
      replyTo: email,
      subject: `[${channelLabel}] ${subject} — from ${name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: #0e2121; border-radius: 12px; padding: 24px; margin-bottom: 20px;">
            <h2 style="color: #36D399; margin: 0 0 4px 0; font-size: 18px;">${channelLabel}</h2>
            <p style="color: #999; margin: 0; font-size: 13px;">Crymad Cash Website — sent to ${recipient}</p>
          </div>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <tr>
              <td style="padding: 10px 12px; font-weight: 600; color: #555; width: 100px; border-bottom: 1px solid #eee;">Name</td>
              <td style="padding: 10px 12px; color: #222; border-bottom: 1px solid #eee;">${name}</td>
            </tr>
            <tr>
              <td style="padding: 10px 12px; font-weight: 600; color: #555; border-bottom: 1px solid #eee;">Email</td>
              <td style="padding: 10px 12px; border-bottom: 1px solid #eee;">
                <a href="mailto:${email}" style="color: #36D399;">${email}</a>
              </td>
            </tr>
            <tr>
              <td style="padding: 10px 12px; font-weight: 600; color: #555; border-bottom: 1px solid #eee;">Subject</td>
              <td style="padding: 10px 12px; color: #222; border-bottom: 1px solid #eee;">${subject}</td>
            </tr>
          </table>
          <div style="background: #f9f9f9; border-radius: 8px; padding: 16px; border-left: 3px solid #36D399;">
            <p style="margin: 0 0 8px 0; font-weight: 600; color: #555; font-size: 13px;">Message:</p>
            <p style="margin: 0; color: #333; line-height: 1.6; white-space: pre-wrap;">${message}</p>
          </div>
          <p style="color: #aaa; font-size: 11px; margin-top: 20px; text-align: center;">
            This email was sent from the Crymad Cash website contact form.
          </p>
        </div>
      `,
    });

    // Auto-reply to sender
    await transporter.sendMail({
      from: `"Crymad Cash" <${process.env.SMTP_USER}>`,
      to: email,
      subject: `We received your message — ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: #0e2121; border-radius: 12px; padding: 24px; margin-bottom: 20px; text-align: center;">
            <h2 style="color: #36D399; margin: 0 0 4px 0; font-size: 20px;">Crymad Ca$h</h2>
            <p style="color: #999; margin: 0; font-size: 12px;">The Future of Digital Finance</p>
          </div>
          <h3 style="color: #222; margin-bottom: 8px;">Hi ${name},</h3>
          <p style="color: #555; line-height: 1.6;">
            Thank you for contacting Crymad Cash. We've received your message regarding
            <strong>"${subject}"</strong> and our team will get back to you within 24 hours.
          </p>
          <div style="background: #f5f5f5; border-radius: 8px; padding: 16px; margin: 20px 0;">
            <p style="margin: 0 0 4px 0; font-weight: 600; color: #555; font-size: 13px;">Your message:</p>
            <p style="margin: 0; color: #666; font-size: 14px; line-height: 1.5; white-space: pre-wrap;">${message}</p>
          </div>
          <p style="color: #555; line-height: 1.6;">
            In the meantime, feel free to reach us directly at
            <a href="mailto:${recipient}" style="color: #36D399;">${recipient}</a>.
          </p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
          <p style="color: #aaa; font-size: 11px; text-align: center;">
            &copy; ${new Date().getFullYear()} Crymad Cash. All rights reserved.<br/>
            This is an automated response. Please do not reply to this email.
          </p>
        </div>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Contact form error:", error);
    return NextResponse.json(
      { error: "Failed to send message. Please try again later." },
      { status: 500 }
    );
  }
}
