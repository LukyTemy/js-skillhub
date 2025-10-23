import { ObjectId } from "mongodb";

export enum EnrollmentStatus {
    Active = "active",
    Cancelled = "cancelled",
    Completed = "completed",
}

export default class Enrollment {
    constructor(
        public userId: ObjectId,
        public courseId: ObjectId,
        public status: EnrollmentStatus,
        public enrolledAt: Date = new Date()
    ) {}

    _id?: ObjectId;
}