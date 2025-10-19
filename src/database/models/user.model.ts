import { ObjectId } from "mongodb";

/**
 * Defines the possible roles a user can have.
 */
export enum UserRole {
    Student = "student",
    Instructor = "instructor",
    Admin = "admin",
}

export default class User {
    constructor(public name: string, public email: string, public password: string, public role: UserRole) {

    }

    _id?: ObjectId;
}