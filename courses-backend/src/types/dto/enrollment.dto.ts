import {IsNotEmpty, IsEnum, IsDate, IsDateString, IsString} from "class-validator";
import {ObjectId} from "mongodb";
import {Type} from "class-transformer";

export enum EnrollmentStatus {
  Active = "active",
  Cancelled = "cancelled",
  Completed = "completed",
}

export class EnrollmentDto {
  @IsNotEmpty()
  public userId: ObjectId;

  @IsNotEmpty()
  public courseId: ObjectId;

  @IsEnum(EnrollmentStatus, { message: "Status must be one of: active, cancelled, or completed" })
  @IsNotEmpty()
  public status: EnrollmentStatus;
}