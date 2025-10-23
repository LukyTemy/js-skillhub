import "reflect-metadata";
import { EnrollmentDto } from "../../../types/dto/enrollment.dto";
import { Request, Response } from "express";
import { enrollmentService } from "../../../services/enrollment.service";
import { validateBody, validateParams } from "../../../middleware/validation.middleware";
import { IdParam } from "../../../types/base.dto";

export class EnrollmentController {
    async create(req: Request, res: Response) {
        const dto = await validateBody(req, EnrollmentDto);
        const enrollment = await enrollmentService.create(dto);
        res.status(201).send(enrollment);
    }

    async getByUser(req: Request, res: Response) {
        const { userId } = req.params;

        if (!userId) {
            return res.status(400).json({ status: "bad input", message: "Missing userId" });
        }

        const enrollments = await enrollmentService.getByUser(userId);
        res.status(200).json(enrollments);
    }

    async delete(req: Request, res: Response) {
        const { id } = await validateParams(req, IdParam);
        const existingEnrollment = await enrollmentService.getById(id);

        if (existingEnrollment === null) {
            res.status(404).send();
            return;
        }

        await enrollmentService.delete(id);
        res.status(204).send();
    }
}