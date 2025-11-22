import Certificate from "../database/models/certificate.model";
import { CertificateDto } from "../types/dto/certificate.dto";
import mongo from "../database/mongo";
import { ObjectId } from "mongodb";

export const certificateService = {
    certificate_collection: mongo.db.collection("certificates"),

    async create(data: CertificateDto) {
        const certificate = new Certificate(new ObjectId(data.userId), new ObjectId(data.courseId), data.fileUrl);
        certificate.issuedAt = new Date();
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

    /*
    async generateCertificate(userId: string, courseId: string, fileUrl: string) {
        const existingCertificate = await this.getUserCertificate(userId, courseId);
        if (existingCertificate) {
            return existingCertificate;
        }

        const certificate = new Certificate(new ObjectId(userId), new ObjectId(courseId), fileUrl);
        certificate.issuedAt = new Date();

        await this.certificate_collection.insertOne(certificate);
        return certificate;
    },
    */
};