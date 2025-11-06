import User from "../database/models/user.model";
import {UserDto} from "../types/dto/user.dto";
import mongo from "../database/mongo";
import {ObjectId} from "mongodb";

export const userService = {
    user_collection: mongo.db.collection("users"),

    async create(data: UserDto) {
        const user = new User(data.name, data.email, data.password, data.role);
        await this.user_collection.insertOne(user);
        return user;
    },

    async getAll() {
        return this.user_collection.find().toArray();
    },

    async getById(id: string) {
        return this.user_collection.findOne({_id: new ObjectId(id)});
    },

    async update(id: string, data: UserDto) {
        return this.user_collection.findOneAndUpdate(
            { _id: new ObjectId(id) },
            { $set: data },
            { returnDocument: "after" }
        );
    },

    async delete(id: string) {
        return this.user_collection.deleteOne({_id: new ObjectId(id)});
    },
};
