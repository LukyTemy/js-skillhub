import { config } from "./config";
import { sendMail } from "./mail.service";
import { loadProto } from "./proto/proto-loader";
import * as grpc from "@grpc/grpc-js";

const mailProto = loadProto("mail");

type GrpcCallback<T> = grpc.sendUnaryData<T>;

type SendMailRequest = {
  to: string;
  subject: string;
  text: string;
};

type SendMailResponse = {
  success: boolean;
  messageId?: string;
  error?: string;
};

export function startGrpcServer(): void {
  const server = new grpc.Server();

  const impl = {
    SendMail: async (
      call: grpc.ServerUnaryCall<SendMailRequest, SendMailResponse>,
      callback: GrpcCallback<SendMailResponse>,
    ) => {
      const { to, subject, text } = call.request;

      if (!to || !subject || !text) {
        callback(null, {
          success: false,
          error: "Missing required fields: to, subject, text",
        });
        return;
      }

      const result = await sendMail({ to, subject, text });
      callback(null, result);
    },
  };

  server.addService(mailProto.MailService.service, impl);

  const address = `0.0.0.0:${config.port}`;

  server.bindAsync(address, grpc.ServerCredentials.createInsecure(), (err, port) => {
    if (err) {
      console.error("Failed to start gRPC server", err);
      process.exit(1);
    }

    console.log(`Mail gRPC service listening on ${address}`);
    server.start();
  });
}
