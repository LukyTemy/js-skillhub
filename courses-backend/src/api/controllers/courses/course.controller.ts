import "reflect-metadata";
import {CourseDto, LessonDto} from "../../../types/dto/course.dto";
import { Request, Response } from "express";
import { courseService } from "../../../services/course.service";
import { validateBody, validateParams } from "../../../middleware/validation.middleware";
import { IdParam } from "../../../types/base.dto";
import { AuthenticatedRequest } from "../../../middleware/auth.middleware";
import { ObjectId } from "mongodb";
import { userService } from "../../../services/user.service";

export class CourseController {

    /**
     * @swagger
     * /courses:
     *   get:
     *     summary: Získá seznam všech kurzů
     *     tags: [Courses]
     *     security:
     *       - bearerAuth: []
     *     responses:
     *       200:
     *         description: Seznam všech kurzů
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 $ref: '#/components/schemas/CourseDto'
     */
    async getAll(req: Request, res: Response) {
        const courses = await courseService.getAll();
        res.status(200).send(courses);
    }

    /**
     * @swagger
     * /courses/{id}:
     *   get:
     *     summary: Získá detail kurzu podle ID
     *     tags: [Courses]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         schema:
     *           type: string
     *         required: true
     *         description: ID kurzu
     *     responses:
     *       200:
     *         description: Detail kurzu
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/CourseDto'
     *       404:
     *         description: Kurz nenalezen
     */
    async getById(req: Request, res: Response) {
        const { id } = await validateParams(req, IdParam);
        const course = await courseService.getById(id);

        if (course === null) {
            res.status(404).send();
            return;
        }

        res.status(200).send(course);
    }

    /**
     * @swagger
     * /courses:
     *   post:
     *     summary: Vytvoří nový kurz
     *     description: Tento endpoint může volat pouze uživatel s rolí **instructor**.
     *     tags: [Courses]
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/CourseDto'
     *     responses:
     *       201:
     *         description: Kurz úspěšně vytvořen
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/CourseDto'
     *       400:
     *         description: Neplatná data nebo instruktor nenalezen
     *       401:
     *         description: Unauthorized - Chybí nebo neplatný token
     *       403:
     *         description: Forbidden - Uživatel nemá roli instruktora
     */
    async create(req: AuthenticatedRequest, res: Response) {
        const dto = await validateBody(req, CourseDto);

        if (!req.user || !req.user.sub) {
            return res.status(401).json({ message: "Authenticated user is required to create a course" });
        }

        const shadowUser = await userService.getByKeycloakUuid(req.user.sub);
        if (!shadowUser || !shadowUser._id) {
            return res.status(400).json({ message: "Instructor not found for current user" });
        }

        dto.instructorId = new ObjectId(shadowUser._id);

        const course = await courseService.create(dto);
        res.status(201).send(course);
    }

    /**
     * @swagger
     * /courses/{id}:
     *   put:
     *     summary: Upraví existující kurz
     *     tags: [Courses]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         schema:
     *           type: string
     *         required: true
     *         description: ID kurzu
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/CourseDto'
     *     responses:
     *       202:
     *         description: Kurz aktualizován
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/CourseDto'
     *       404:
     *         description: Kurz nenalezen
     */
    async update(req: Request, res: Response) {
        const { id } = await validateParams(req, IdParam);
        const dto = await validateBody(req, CourseDto);
        const existingCourse = await courseService.getById(id);

        if (existingCourse === null) {
            res.status(404).send();
            return;
        }

        const course = await courseService.update(id, dto);
        res.status(202).send(course);
    }

    /**
     * @swagger
     * /courses/{id}:
     *   delete:
     *     summary: Smaže kurz
     *     tags: [Courses]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         schema:
     *           type: string
     *         required: true
     *         description: ID kurzu
     *     responses:
     *       204:
     *         description: Kurz úspěšně smazán
     */
    async delete(req: Request, res: Response) {
        const { id } = await validateParams(req, IdParam);
        await courseService.delete(id);
        res.status(204).send();
    }

    /**
     * @swagger
     * /courses/{id}/lessons:
     *   post:
     *     summary: Přidá lekci do kurzu
     *     tags: [Courses]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         schema:
     *           type: string
     *         required: true
     *         description: ID kurzu
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/LessonDto'
     *     responses:
     *       201:
     *         description: Lekce přidána, vrací aktualizovaný kurz
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/CourseDto'
     *       404:
     *         description: Kurz nenalezen
     */
    async addLesson(req: Request, res: Response) {
        const { id } = await validateParams(req, IdParam);
        const dto = await validateBody(req, LessonDto);
        const existingCourse = await courseService.getById(id);

        if (existingCourse === null) {
            res.status(404).send();
            return;
        }

        const course = await courseService.addLesson(id, dto);
        res.status(201).send(course);
    }

    /**
     * @swagger
     * /courses/{id}/lessons/{lessonId}:
     *   put:
     *     summary: Upraví konkrétní lekci v kurzu
     *     tags: [Courses]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         schema:
     *           type: string
     *         required: true
     *         description: ID kurzu
     *       - in: path
     *         name: lessonId
     *         schema:
     *           type: string
     *         required: true
     *         description: ID lekce (ObjectId)
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/LessonDto'
     *     responses:
     *       202:
     *         description: Lekce aktualizována
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/CourseDto'
     *       404:
     *         description: Kurz nenalezen
     */
    async updateLesson(req: Request, res: Response) {
        const { id, lessonId } = req.params;
        const dto = await validateBody(req, LessonDto);
        const existingCourse = await courseService.getById(id);

        if (existingCourse === null) {
            res.status(404).send();
            return;
        }

        const course = await courseService.updateLesson(id, lessonId, dto);
        res.status(202).send(course);
    }

    /**
     * @swagger
     * /courses/{id}/lessons/{lessonId}:
     *   delete:
     *     summary: Smaže lekci z kurzu
     *     tags: [Courses]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         schema:
     *           type: string
     *         required: true
     *         description: ID kurzu
     *       - in: path
     *         name: lessonId
     *         schema:
     *           type: string
     *         required: true
     *         description: ID lekce
     *     responses:
     *       202:
     *         description: Lekce smazána, vrací aktualizovaný kurz
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/CourseDto'
     *       404:
     *         description: Kurz nenalezen
     */
    async deleteLesson(req: Request, res: Response) {
        const { id, lessonId } = req.params;
        const existingCourse = await courseService.getById(id);

        if (existingCourse === null) {
            res.status(404).send();
            return;
        }

        const course = await courseService.deleteLesson(id, lessonId);
        res.status(202).send(course);
    }

    /**
     * @swagger
     * /instructors/{id}/courses:
     *   get:
     *     summary: Získá všechny kurzy daného instruktora
     *     tags: [Courses]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         schema:
     *           type: string
     *         required: true
     *         description: ID instruktora (User ID)
     *     responses:
     *       200:
     *         description: Seznam kurzů instruktora
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 $ref: '#/components/schemas/CourseDto'
     */
    async getByInstructor(req: Request, res: Response) {
        const { id } = await validateParams(req, IdParam);
        const courses = await courseService.getByInstructor(id);
        res.status(200).send(courses);
    }
}