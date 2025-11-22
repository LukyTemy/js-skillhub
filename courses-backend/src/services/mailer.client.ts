import path from "path";
import protoLoader from "@grpc/proto-loader";
import grpc from "@grpc/grpc-js";

const PROTO_PATH = path.join(__dirname, "..", "..", "..", "mailing-service", "src", "proto", "mail.proto");

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const proto: any = grpc.loadPackageDefinition(packageDefinition).mail;

const addr = process.env.MAIL_GRPC_ADDR || "localhost:50051";

const client = new proto.MailService(addr, grpc.credentials.createInsecure());

export function sendVerificationEmail(payload: { to: string; subject: string; bodyHtml?: string; bodyText?: string; }){
    return new Promise<{success:boolean; message:string}>((resolve, reject)=>{
        client.SendVerification(payload, (err: any, res: any) => {
            if(err) return reject(err);
            resolve(res);
        });
    });
}

