import dotenv from "dotenv";

dotenv.config();

export interface MailConfig {
  port: number;
  smtpHost: string;
  smtpPort: number;
  smtpSecure: boolean;
  smtpUser: string;
  smtpPass: string;
  smtpFrom: string;
}

export const config: MailConfig = {
  port: Number(process.env.MAIL_SERVICE_PORT ?? 50051),
  smtpHost: process.env.SMTP_HOST ?? "localhost",
  smtpPort: Number(process.env.SMTP_PORT ?? 1025),
  smtpSecure: (process.env.SMTP_SECURE ?? "false").toLowerCase() === "true",
  smtpUser: process.env.SMTP_USER ?? "",
  smtpPass: process.env.SMTP_PASS ?? "",
  smtpFrom: process.env.SMTP_FROM ?? "no-reply@example.com",
};

