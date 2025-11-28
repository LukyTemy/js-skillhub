import "reflect-metadata";
import {UserDto, UserFromKeycloakDto, UserRole} from "../../../types/dto/user.dto"; // <--- PŘIDÁN IMPORT UserRole
import {Request, Response} from "express";
import {userService} from "../../../services/user.service";
import {validateBody, validateParams,} from "../../../middleware/validation.middleware";
import {IdParam} from "../../../types/base.dto";
import {AuthenticatedRequest} from "../../../middleware/auth.middleware";

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

    async registerFromKeycloak(req: AuthenticatedRequest, res: Response) {
        const authUser = req.user as any;

        if (!authUser || !authUser.sub) {
            res.status(400).json({ error: 'Missing user data from token' });
            return;
        }

        const dto = new UserFromKeycloakDto();
        dto.keycloakUuid = authUser.sub;
        dto.email = authUser.email;
        dto.name = authUser.name || authUser.preferred_username;


        const clientRoles = authUser.resource_access?.['web-app']?.roles || [];


        if (clientRoles.includes('admin')) {
            dto.role = UserRole.Admin;
        } else if (clientRoles.includes('instructor')) {
            dto.role = UserRole.Instructor;
        } else {
            dto.role = UserRole.Student;
        }

        try {
            const user = await userService.createOrUpdateFromKeycloak(dto);
            res.status(200).send(user);
        } catch (err) {
            console.error('Error in registerFromKeycloak:', err);
            res.status(500).json({ error: 'Failed to register user from Keycloak' });
        }
    }
}