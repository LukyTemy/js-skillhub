import Notification from "../database/models/notification.model";
import { NotificationDto } from "../types/dto/notification.dto";
import mongo from "../database/mongo";
import { ObjectId } from "mongodb";

export const notificationService = {
    notification_collection: mongo.db.collection("notifications"),

    async create(data: NotificationDto) {
        const notification = new Notification(new ObjectId(data.userId), data.message, data.read);
        notification.timestamp = new Date();
        await this.notification_collection.insertOne(notification);
        return notification;
    },

    async getById(id: string) {
        return this.notification_collection.findOne({ _id: new ObjectId(id) });
    },

    async update(id: string, data: NotificationDto) {
        return this.notification_collection.findOneAndUpdate(
            { _id: new ObjectId(id) },
            { $set: data },
            { returnDocument: "after" }
        );
    },

    async delete(id: string) {
        return this.notification_collection.deleteOne({ _id: new ObjectId(id) });
    },

    async getByUser(userId: string) {
        return this.notification_collection.find({ userId: new ObjectId(userId) }).sort({ timestamp: -1 }).toArray();
    },

    async markAsRead(id: string) {
        return this.notification_collection.findOneAndUpdate(
            { _id: new ObjectId(id) },
            { $set: { read: true } },
            { returnDocument: "after" }
        );
    },

    async markAllAsRead(userId: string) {
        return this.notification_collection.updateMany(
            { userId: new ObjectId(userId), read: false },
            { $set: { read: true } }
        );
    },
};