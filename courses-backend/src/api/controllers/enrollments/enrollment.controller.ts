import "reflect-metadata";
import {EnrollmentDto, EnrollmentStatus} from "../../../types/dto/enrollment.dto";
import { Request, Response } from "express";
import { enrollmentService } from "../../../services/enrollment.service";
import { validateBody, validateParams } from "../../../middleware/validation.middleware";
import { IdParam } from "../../../types/base.dto";
import {ApiError} from "../../../types/api.error";
import {userService} from "../../../services/user.service";
import {courseService} from "../../../services/course.service";
import {CertificateDto} from "../../../types/dto/certificate.dto";
import {certificateService} from "../../../services/certificate.service";

export class EnrollmentController {
    /**
     * @swagger
     * /enrollments:
     *   post:
     *     summary: Vytvoří nový zápis do kurzu
     *     tags: [Enrollments]
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/EnrollmentDto'
     *     responses:
     *       201:
     *         description: Zápis vytvořen
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/EnrollmentDto'
     *       400:
     *         description: Nevalidní data
     */
    async create(req: Request, res: Response) {
        const dto = await validateBody(req, EnrollmentDto);
        const enrollment = await enrollmentService.create(dto);
        res.status(201).send(enrollment);
    }

    /**
     * @swagger
     * /enrollments/user/{userId}:
     *   get:
     *     summary: Vrátí všechny zápisy pro daného uživatele
     *     tags: [Enrollments]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: userId
     *         required: true
     *         schema:
     *           type: string
     *         description: ID uživatele (MongoDB ObjectId)
     *     responses:
     *       200:
     *         description: Seznam uživatelových zápisů
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 $ref: '#/components/schemas/EnrollmentDto'
     *       400:
     *         description: Uživatel nebyl nalezen
     */
    async getByUser(req: Request, res: Response) {
        const { userId } = req.params;

        if (!userId) {
            throw new ApiError("Not Found", "User was not found", 400)
        }

        const enrollments = await enrollmentService.getByUser(userId);
        res.status(200).send(enrollments);
    }

    /**
     * @swagger
     * /enrollments/{id}/status:
     *   patch:
     *     summary: Změní stav zápisu (např. na 'completed' nebo 'cancelled')
     *     tags: [Enrollments]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *         description: ID zápisu (MongoDB ObjectId)
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - status
     *             properties:
     *               status:
     *                 $ref: '#/components/schemas/EnrollmentStatus'
     *     responses:
     *       200:
     *         description: Stav byl úspěšně změněn
     *       404:
     *         description: Zápis nenalezen
     */
    async updateStatus(req: Request, res: Response) {
        const { id } = await validateParams(req, IdParam);
        const { status } = req.body;

        const currentEnrollment = await enrollmentService.getById(id);
        if (!currentEnrollment) {
            res.status(404).send({ message: "Enrollment not found" });
            return;
        }

        const updated = await enrollmentService.update(id, { status } as any);

        if (status === EnrollmentStatus.Completed) {
            try {
                const user = await userService.getById(currentEnrollment.userId.toString());
                const course = await courseService.getById(currentEnrollment.courseId.toString());

                if (user && course) {
                    const certDto = new CertificateDto();
                    certDto.userId = currentEnrollment.userId;
                    certDto.courseId = currentEnrollment.courseId;
                    certDto.issuedAt = new Date();
                    certDto.fileUrl = "";

                    await certificateService.create(certDto);

                    console.log(`🎓 Certificate generated for user ${user.name} in course ${course.title}`);
                }
            } catch (err) {
                // Chyba při generování certifikátu by neměla shodit dokončení kurzu
                console.error("❌ Failed to generate certificate during completion:", err);
            }
        }

        res.status(200).send(updated);
    }

    /**
     * @swagger
     * /enrollments/{id}:
     *   delete:
     *     summary: Smaže zápis do kurzu
     *     tags: [Enrollments]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *         description: ID zápisu (MongoDB ObjectId)
     *     responses:
     *       204:
     *         description: Zápis byl smazán
     *       404:
     *         description: Zápis neexistuje
     */
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