import { ObjectId } from "mongodb";

export default class Notification {
    constructor(
        public userId: ObjectId,
        public message: string,
        public read: boolean = false
    ) {}

    _id?: ObjectId;
    timestamp?: Date;
}