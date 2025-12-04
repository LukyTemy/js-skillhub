import Certificate from "../database/models/certificate.model";
import { CertificateDto } from "../types/dto/certificate.dto";
import mongo from "../database/mongo";
import { ObjectId } from "mongodb";
import { generateCertificate } from "../grpc/certificate.client";
import { userService } from "./user.service";
import { courseService } from "./course.service";

export const certificateService = {
    certificate_collection: mongo.db.collection("certificates"),

    async create(data: CertificateDto) {
        const user = await userService.getById(data.userId.toString());
        const course = await courseService.getById(data.courseId.toString());

        if (!user || !course) {
            throw new Error("User or Course not found for certificate generation");
        }

        let pdfUrl = "";
        try {
            const grpcResponse = await generateCertificate({
                studentName: user.name,
                courseName: course.title,
                completionDate: data.issuedAt.toISOString(),
                userId: data.userId.toString()
            });

            if (grpcResponse.success) {
                pdfUrl = grpcResponse.pdfUrl;
            } else {
                console.error("gRPC service returned error:", grpcResponse.error);
            }
        } catch (e) {
            console.error("Failed to call certificate microservice:", e);
        }

        const certificate = new Certificate(
            new ObjectId(data.userId),
            new ObjectId(data.courseId),
            data.fileUrl || pdfUrl
        );
        certificate.issuedAt = data.issuedAt;

        await this.certificate_collection.insertOne(certificate);
        return certificate;
    },

    async getAll() {
        return this.certificate_collection.find().toArray();
    },
    async getById(id: string) {
        return this.certificate_collection.findOne({ _id: new ObjectId(id) });
    },
    async update(id: string, data: CertificateDto) {
        return this.certificate_collection.findOneAndUpdate(
            { _id: new ObjectId(id) },
            { $set: data },
            { returnDocument: "after" }
        );
    },
    async delete(id: string) {
        return this.certificate_collection.deleteOne({ _id: new ObjectId(id) });
    },
    async getByUser(userId: string) {
        return this.certificate_collection.find({ userId: new ObjectId(userId) }).toArray();
    },
    async getUserCertificate(userId: string, courseId: string) {
        return this.certificate_collection.findOne({
            userId: new ObjectId(userId),
            courseId: new ObjectId(courseId)
        });
    },
};