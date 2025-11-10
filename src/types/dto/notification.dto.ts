import {IsNotEmpty, IsUUID, IsString, IsBoolean, IsDate, Length} from "class-validator";
import {ObjectId} from "mongodb";

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