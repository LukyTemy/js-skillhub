import * as grpc from '@grpc/grpc-js';
import { loadProto } from './proto-loader';

const certificatePackage = loadProto('certificate');
const CertificateService = certificatePackage.CertificateService;

const CERTIFICATE_SERVICE_ADDRESS = process.env.CERTIFICATE_SERVICE_ADDRESS || 'certificate-service:50052';

const client = new CertificateService(
    CERTIFICATE_SERVICE_ADDRESS,
    grpc.credentials.createInsecure()
);

export const generateCertificate = (data: { studentName: string, courseName: string, completionDate: string, userId: string }): Promise<any> => {
    return new Promise((resolve, reject) => {
        client.GenerateCertificate(data, (err: any, response: any) => {
            if (err) {
                console.error("gRPC Error:", err);
                reject(err);
            } else {
                resolve(response);
            }
        });
    });
};