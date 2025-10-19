import { IsNotEmpty, IsUUID, IsDate, IsUrl } from "class-validator";

export class CertificateDto {
  @IsUUID()
  @IsNotEmpty()
  public userId: string;

  @IsUUID()
  @IsNotEmpty()
  public courseId: string;

  @IsDate()
  @IsNotEmpty()
  public issuedAt: Date;

  @IsUrl()
  @IsNotEmpty()
  public fileUrl: string;
}