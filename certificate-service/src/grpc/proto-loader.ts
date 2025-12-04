import * as grpc from "@grpc/grpc-js";
import * as protoLoader from "@grpc/proto-loader";
import path from "path";
import { protoOptions } from "./proto-options";

export function loadProto(name: string) {
    const PROTO_PATH = path.join(__dirname, name + ".proto");

    const packageDefinition = protoLoader.loadSync(PROTO_PATH, protoOptions);
    return (grpc.loadPackageDefinition(packageDefinition) as any)[name];
}