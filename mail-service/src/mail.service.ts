import nodemailer from "nodemailer";
import { config } from "./config";

const transporter = nodemailer.createTransport({
  host: config.smtpHost,
  port: config.smtpPort,
  secure: config.smtpSecure,
  auth: {
    user: config.smtpUser,
    pass: config.smtpPass,
  },
});

// Ověření, že spojení funguje
transporter.verify((error, success) => {
  if (error) {
    console.error("Chyba při připojení k SMTP serveru:", error);
  } else {
    console.log("SMTP server je připraven k odesílání zpráv");
  }
});

export interface SendMailInput {
  to: string;
  subject: string;
  text: string;
}

export interface SendMailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export async function sendMail(input: SendMailInput): Promise<SendMailResult> {
  try {
    const info = await transporter.sendMail({
      from: config.smtpFrom,
      to: input.to,
      subject: input.subject,
      text: input.text,
    });

    console.log("Email odeslán: %s", info.messageId);

    return {
      success: true,
      messageId: info.messageId,
    };
  } catch (err: any) {
    console.error("Chyba při odesílání emailu:", err);
    return {
      success: false,
      error: err?.message ?? "Unknown error",
    };
  }
}