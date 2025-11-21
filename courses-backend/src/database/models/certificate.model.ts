import { ObjectId } from "mongodb";

export default class Certificate {
    constructor(
        public userId: ObjectId,
        public courseId: ObjectId,
        public fileUrl: string
    ) {}

    _id?: ObjectId;
    issuedAt?: Date;
}