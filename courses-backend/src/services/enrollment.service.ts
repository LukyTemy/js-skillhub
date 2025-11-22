import Enrollment from "../database/models/enrollment.model";
import {EnrollmentDto} from "../types/dto/enrollment.dto";
import mongo from "../database/mongo";
import {ObjectId} from "mongodb";

export const enrollmentService = {
    enrollment_collection: mongo.db.collection("enrollments"),

    async create(data: EnrollmentDto) {
        const enrollment = new Enrollment(new ObjectId(data.userId), new ObjectId(data.courseId), data.status);
        await this.enrollment_collection.insertOne(enrollment);
        return enrollment;
    },

    async getById(id: string) {
        return this.enrollment_collection.findOne({ _id: new ObjectId(id) });
    },

    async update(id: string, data: EnrollmentDto) {
        return this.enrollment_collection.findOneAndUpdate(
            { _id: new ObjectId(id) },
            { $set: data },
            { returnDocument: "after" }
        );
    },

    async delete(id: string) {
        return this.enrollment_collection.deleteOne({ _id: new ObjectId(id) });
    },

    async getByUser(userId: string) {
        const userObjectId = new ObjectId(userId);

        return await this.enrollment_collection
            .find({userId: userObjectId})
            .toArray();
    },

    async getByCourse(courseId: string) {
        return this.enrollment_collection.find({ courseId: new ObjectId(courseId) }).toArray();
    },

    async getUserEnrollment(userId: string, courseId: string) {
        return this.enrollment_collection.findOne({
            userId: new ObjectId(userId),
            courseId: new ObjectId(courseId)
        });
    },

    async cancelEnrollment(id: string) {
        return this.enrollment_collection.findOneAndUpdate(
            { _id: new ObjectId(id) },
            { $set: { status: "cancelled" } },
            { returnDocument: "after" }
        );
    },
};