import {IsNotEmpty, IsUUID, IsString, IsBoolean, IsDate, Length} from "class-validator";
import {ObjectId} from "mongodb";

/**
 * @swagger
 * components:
 *   schemas:
 *     NotificationDto:
 *       type: object
 *       required:
 *         - userId
 *         - message
 *         - read
 *         - timestamp
 *       properties:
 *         userId:
 *           type: string
 *           description: ID uživatele (MongoDB ObjectId)
 *           example: "507f1f77bcf86cd799439011"
 *         message:
 *           type: string
 *           description: Text notifikace
 *           example: "Kurz byl úspěšně dokončen."
 *         read:
 *           type: boolean
 *           description: Zda byla notifikace přečtena
 *           example: false
 *         timestamp:
 *           type: string
 *           format: date-time
 *           description: Datum a čas vytvoření notifikace
 *           example: "2024-01-12T14:55:00Z"
 */
export class NotificationDto {
  @IsNotEmpty()
  public userId: ObjectId;

  @IsString()
  @Length(1, 500, { message: "Message must be between 1 and 500 characters" })
  @IsNotEmpty()
  public message: string;

  @IsBoolean()
  @IsNotEmpty()
  public read: boolean;

  @IsDate()
  @IsNotEmpty()
  public timestamp: Date;
}