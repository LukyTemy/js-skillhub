import User from "../database/models/user.model";
import {UserDto, UserFromKeycloakDto} from "../types/dto/user.dto";
import mongo from "../database/mongo";
import {ObjectId} from "mongodb";

export const userService = {
    user_collection: mongo.db.collection("users"),

    async getAll() {
        return this.user_collection.find().toArray();
    },

    async getById(id: string) {
        return this.user_collection.findOne({_id: new ObjectId(id)});
    },

    async getByKeycloakUuid(uuid: string) {
        return this.user_collection.findOne({ keycloakUuid: uuid });
    },

    async getByEmail(email: string) {
        return this.user_collection.findOne({ email: email });
    },

    async createFromKeycloak(data: UserFromKeycloakDto) {
        const user = new User(data.name ?? '', data.email ?? '', data.role ?? ("student" as any), data.keycloakUuid);
        await this.user_collection.insertOne(user);
        return user;
    },

    async createOrUpdateFromKeycloak(data: UserFromKeycloakDto) {
        const byUuid = await this.getByKeycloakUuid(data.keycloakUuid);
        if (byUuid) {
            const update: any = {};
            if (data.name && (!byUuid.name || byUuid.name.length === 0)) update.name = data.name;
            if (data.email && (!byUuid.email || byUuid.email.length === 0)) update.email = data.email;
            if (data.role && (!byUuid.role)) update.role = data.role;
            if (Object.keys(update).length > 0) {
                await this.user_collection.updateOne({ keycloakUuid: data.keycloakUuid }, { $set: update });
            }
            return await this.getByKeycloakUuid(data.keycloakUuid);
        }

        if (data.email) {
            const byEmail = await this.getByEmail(data.email);
            if (byEmail) {
                await this.user_collection.updateOne({ _id: byEmail._id }, { $set: { keycloakUuid: data.keycloakUuid } });
                return await this.getById(byEmail._id.toString());
            }
        }
        return await this.createFromKeycloak(data);
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
