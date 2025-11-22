import { loadProto } from "./proto-loader";
import * as grpc from "@grpc/grpc-js";

const mailProto = loadProto("mail");

const MAIL_SERVICE_ADDRESS = process.env.MAIL_SERVICE_ADDRESS ?? "localhost:50051";

const client = new mailProto.MailService(
  MAIL_SERVICE_ADDRESS,
  grpc.credentials.createInsecure(),
);

export interface SendMailRequest {
  to: string;
  subject: string;
  text: string;
}

export interface SendMailResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

export function sendMail(req: SendMailRequest): Promise<SendMailResponse> {
  return new Promise((resolve, reject) => {
    client.SendMail(req, (err: grpc.ServiceError | null, response: SendMailResponse) => {
      if (err) {
        return reject(err);
      }

      resolve(response);
    });
  });
}
