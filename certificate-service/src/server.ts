import * as grpc from '@grpc/grpc-js';
import { loadProto } from './grpc/proto-loader';
import { GeneratorService } from './services/generator.service';
import { StorageService } from './services/storage.service';

const generatorService = new GeneratorService();
const storageService = new StorageService();

const certificatePackage = loadProto('certificate');
const certificateService = certificatePackage.CertificateService;

const generateCertificate = async (call: any, callback: any) => {
    const { studentName, courseName, completionDate, userId } = call.request;
    console.log(`🎓 Generating certificate for ${studentName} - ${courseName}`);

    try {
        const pdfBuffer = await generatorService.generate(studentName, courseName, completionDate);

        const fileName = `cert_${userId}_${Date.now()}.pdf`;
        const publicUrl = await storageService.uploadFile(pdfBuffer, `certificates/${fileName}`);

        console.log(`✅ Certificate uploaded: ${publicUrl}`);

        callback(null, {
            pdfUrl: publicUrl,
            success: true
        });

    } catch (error: any) {
        console.error("❌ Error generating certificate:", error);
        callback(null, {
            pdfUrl: "",
            success: false,
            error: error.message
        });
    }
};

const main = () => {
    const server = new grpc.Server();

    server.addService(certificateService.service, {
        GenerateCertificate: generateCertificate
    });

    const port = process.env.PORT || '50052';
    server.bindAsync(`0.0.0.0:${port}`, grpc.ServerCredentials.createInsecure(), () => {
        console.log(`🚀 Certificate gRPC Service running on port ${port}`);
    });
};

main();