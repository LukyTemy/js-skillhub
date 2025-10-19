import "reflect-metadata";
import {UserDto} from "../../../types/dto/user.dto";
import {Request, Response} from "express";
import {userService} from "../../../services/user.service";
import {validateBody, validateParams,} from "../../../middleware/validation.middleware";
import {IdParam} from "../../../types/base.dto";

export class UserController {
    async getAll(req: Request, res: Response) {
        const user = await userService.getAll();
        res.status(200).send(user);
    }

    async getById(req: Request, res: Response) {
        const {id} = await validateParams(req, IdParam);
        const user = await userService.getById(id);

        if (user === null) {
            res.status(404).send();
            return;
        }

        res.status(200).send(user);
    }

    async create(req: Request, res: Response) {
        const dto = await validateBody(req, UserDto);
        const user = await userService.create(dto);
        res.status(201).send(user);
    }

    async update(req: Request, res: Response) {
        const {id} = await validateParams(req, IdParam);
        const dto = await validateBody(req, UserDto);
        const existingUser = await userService.getById(id);

        if (existingUser === null) {
            res.status(404).send();
            return;
        }

        const user = await userService.update(id, dto);
        res.status(202).send(user);
    }

    async delete(req: Request, res: Response) {
        const {id} = await validateParams(req, IdParam);
        await userService.delete(id);
        res.status(204).send();
    }
}
