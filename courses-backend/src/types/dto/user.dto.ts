import { IsNotEmpty, IsEmail, IsString, Length, IsEnum, IsOptional } from "class-validator";

export enum UserRole {
    Student = "student",
    Instructor = "instructor",
    Admin = "admin",
}

/**
 * @swagger
 * components:
 *   schemas:
 *     UserRole:
 *       type: string
 *       enum:
 *         - student
 *         - instructor
 *         - admin
 *
 *     UserDto:
 *       type: object
 *       required:
 *         - name
 *         - email
 *         - role
 *       properties:
 *         name:
 *           type: string
 *           minLength: 2
 *           maxLength: 32
 *           example: Jan Novák
 *         email:
 *           type: string
 *           format: email
 *           example: jan.novak@example.com
 *         role:
 *           $ref: '#/components/schemas/UserRole'
 *
 *     UserFromKeycloakDto:
 *       type: object
 *       required:
 *         - keycloakUuid
 *       properties:
 *         keycloakUuid:
 *           type: string
 *           example: 550e8400-e29b-41d4-a716-446655440000
 *         name:
 *           type: string
 *         email:
 *           type: string
 *           format: email
 *         role:
 *           $ref: '#/components/schemas/UserRole'
 */
export class UserDto {
    @IsString()
    @Length(2, 32, { message: "Name must be between 2 and 32 characters" })
    @IsNotEmpty()
    public name: string;

    @IsEmail()
    @IsNotEmpty()
    public email: string;

    @IsEnum(UserRole, { message: "Role must be one of: student, instructor, or admin" })
    @IsNotEmpty()
    public role: UserRole;
}
export class UserFromKeycloakDto {
    @IsString()
    @IsNotEmpty()
    public keycloakUuid: string;

    @IsString()
    @IsOptional()
    public name?: string;

    @IsEmail()
    @IsOptional()
    public email?: string;

    @IsEnum(UserRole, { message: "Role must be one of: student, instructor, or admin" })
    @IsOptional()
    public role?: UserRole;
}