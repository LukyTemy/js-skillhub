import { IsNotEmpty, IsEmail, IsString, Length, IsEnum } from "class-validator";

/**
 * Defines the possible roles a user can have.
 */
export enum UserRole {
    Student = "student",
    Instructor = "instructor",
    Admin = "admin",
}

export class UserDto {

    @IsString()
    @Length(2, 32, { message: "Name must be between 2 and 32 characters" })
    @IsNotEmpty()
    public name!: string;

    @IsEmail()
    @IsNotEmpty()
    public email: string;

    @IsString()
    @Length(8, 32, { message: "Password must be at least 8 characters" })
    @IsNotEmpty()
    public password: string;

    @IsEnum(UserRole, { message: "Role must be one of: student, instructor, or admin" })
    @IsNotEmpty()
    public role: UserRole;
}