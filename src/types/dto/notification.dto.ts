import {IsNotEmpty, IsUUID, IsString, IsBoolean, IsDate, Length} from "class-validator";

export class NotificationDto {
  @IsUUID()
  @IsNotEmpty()
  public userId: string;

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