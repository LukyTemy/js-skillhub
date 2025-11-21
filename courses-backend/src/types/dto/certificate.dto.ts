import { IsNotEmpty, IsUUID, IsDate, IsUrl } from "class-validator";
import {ObjectId} from "mongodb";

export class CertificateDto {
  @IsNotEmpty()
  public userId: ObjectId;

  @IsNotEmpty()
  public courseId: ObjectId;

  @IsDate()
  @IsNotEmpty()
  public issuedAt: Date;

  @IsUrl()
  @IsNotEmpty()
  public fileUrl: string;
}