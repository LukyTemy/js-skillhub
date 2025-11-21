import "reflect-metadata";
import {CourseDto, LessonDto} from "../../../types/dto/course.dto";
import { Request, Response } from "express";
import { courseService } from "../../../services/course.service";
import { validateBody, validateParams } from "../../../middleware/validation.middleware";
import { IdParam } from "../../../types/base.dto";

export class CourseController {
    async getAll(req: Request, res: Response) {
        const courses = await courseService.getAll();
        res.status(200).send(courses);
    }

    async getById(req: Request, res: Response) {
        const { id } = await validateParams(req, IdParam);
        const course = await courseService.getById(id);

        if (course === null) {
            res.status(404).send();
            return;
        }

        res.status(200).send(course);
    }

    async create(req: Request, res: Response) {
        const dto = await validateBody(req, CourseDto);
        const course = await courseService.create(dto);
        res.status(201).send(course);
    }

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

    async delete(req: Request, res: Response) {
        const { id } = await validateParams(req, IdParam);
        await courseService.delete(id);
        res.status(204).send();
    }

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
}