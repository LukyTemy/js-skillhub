import { IsNotEmpty, IsUUID, IsDate, IsUrl } from "class-validator";
import {ObjectId} from "mongodb";

/**
 * @swagger
 * components:
 *   schemas:
 *     CertificateDto:
 *       type: object
 *       required:
 *         - userId
 *         - courseId
 *         - issuedAt
 *         - fileUrl
 *       properties:
 *         userId:
 *           type: string
 *           description: ID uživatele (MongoDB ObjectId)
 *           example: "507f1f77bcf86cd799439011"
 *         courseId:
 *           type: string
 *           description: ID kurzu (MongoDB ObjectId)
 *           example: "507f1f77bcf86cd799439012"
 *         issuedAt:
 *           type: string
 *           format: date-time
 *           description: Datum vydání certifikátu
 *           example: "2023-10-25T10:00:00Z"
 *         fileUrl:
 *           type: string
 *           format: uri
 *           description: URL adresa k souboru certifikátu (PDF)
 *           example: "https://storage.example.com/certificates/cert-123.pdf"
 */
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