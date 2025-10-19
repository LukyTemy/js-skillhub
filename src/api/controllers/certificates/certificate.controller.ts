import "reflect-metadata";
import { CertificateDto } from "../../../types/dto/certificate.dto";
import { Request, Response } from "express";
import { certificateService } from "../../../services/certificate.service";
import {validateBody, validateParams} from "../../../middleware/validation.middleware";
import {IdParam} from "../../../types/base.dto";

export class CertificateController {
    async getUserCertificate(req: Request, res: Response) {
        const { userId, courseId } = req.params;
        const certificate = await certificateService.getUserCertificate(userId, courseId);

        if (certificate === null) {
            res.status(404).send();
            return;
        }

        res.status(200).send(certificate);
    }

    async create(req: Request, res: Response) {
        const dto = await validateBody(req, CertificateDto);
        const certificate = await certificateService.create(dto);
        res.status(201).send(certificate);
    }

    async getAll(req: Request, res: Response) {
        const certificates = await certificateService.getAll();
        res.status(200).send(certificates);
    }

    async getById(req: Request, res: Response) {
        const { id } = await validateParams(req, IdParam);
        const certificate = await certificateService.getById(id);

        if (certificate === null) {
            res.status(404).send();
            return;
        }

        res.status(200).send(certificate);
    }

    async update(req: Request, res: Response) {
        const { id } = await validateParams(req, IdParam);
        const dto = await validateBody(req, CertificateDto);
        const existingCertificate = await certificateService.getById(id);

        if (existingCertificate === null) {
            res.status(404).send();
            return;
        }

        const certificate = await certificateService.update(id, dto);
        res.status(202).send(certificate);
    }

    async delete(req: Request, res: Response) {
        const { id } = await validateParams(req, IdParam);
        await certificateService.delete(id);
        res.status(204).send();
    }
}