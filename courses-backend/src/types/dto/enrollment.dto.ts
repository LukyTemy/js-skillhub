import {IsNotEmpty, IsEnum, IsDate, IsDateString, IsString} from "class-validator";
import {ObjectId} from "mongodb";
import {Type} from "class-transformer";

export enum EnrollmentStatus {
    Active = "active",
    Cancelled = "cancelled",
    Completed = "completed",
}

/**
 * @swagger
 * components:
 *   schemas:
 *     EnrollmentStatus:
 *       type: string
 *       enum: [active, cancelled, completed]
 *       description: Stav zápisu do kurzu
 *
 *     EnrollmentDto:
 *       type: object
 *       required:
 *         - userId
 *         - courseId
 *         - status
 *       properties:
 *         userId:
 *           type: string
 *           description: ID uživatele (MongoDB ObjectId)
 *           example: "507f1f77bcf86cd799439011"
 *         courseId:
 *           type: string
 *           description: ID kurzu (MongoDB ObjectId)
 *           example: "507f1f77bcf86cd799439012"
 *         status:
 *           $ref: '#/components/schemas/EnrollmentStatus'
 */
export class EnrollmentDto {
    @IsNotEmpty()
    public userId: ObjectId;

    @IsNotEmpty()
    public courseId: ObjectId;

    @IsEnum(EnrollmentStatus, { message: "Status must be one of: active, cancelled, or completed" })
    @IsNotEmpty()
    public status: EnrollmentStatus;
}