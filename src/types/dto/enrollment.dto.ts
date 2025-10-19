import { IsNotEmpty, IsUUID, IsEnum, IsDate } from "class-validator";

export enum EnrollmentStatus {
  Active = "active",
  Cancelled = "cancelled",
  Completed = "completed",
}

export class EnrollmentDto {
  @IsUUID()
  @IsNotEmpty()
  public userId: string;

  @IsUUID()
  @IsNotEmpty()
  public courseId: string;

  @IsEnum(EnrollmentStatus, { message: "Status must be one of: active, cancelled, or completed" })
  @IsNotEmpty()
  public status: EnrollmentStatus;

  @IsDate()
  @IsNotEmpty()
  public enrolledAt: Date;
}