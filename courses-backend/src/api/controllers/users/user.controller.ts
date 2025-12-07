import "reflect-metadata";
import {UserDto, UserFromKeycloakDto, UserRole} from "../../../types/dto/user.dto";
import {Request, Response} from "express";
import {userService} from "../../../services/user.service";
import {validateBody, validateParams,} from "../../../middleware/validation.middleware";
import {IdParam} from "../../../types/base.dto";
import {AuthenticatedRequest} from "../../../middleware/auth.middleware";

export class UserController {

    /**
     * @swagger
     * /users:
     *   get:
     *     summary: Vrátí seznam všech uživatelů
     *     tags: [Users]
     *     security:
     *       - bearerAuth: []
     *     responses:
     *       200:
     *         description: Seznam uživatelů
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 $ref: '#/components/schemas/UserDto'
     */
    async getAll(req: Request, res: Response) {
        const user = await userService.getAll();
        res.status(200).send(user);
    }

    /**
     * @swagger
     * /users/{id}:
     *   get:
     *     summary: Vrátí uživatele podle ID
     *     tags: [Users]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *         description: ID uživatele
     *     responses:
     *       200:
     *         description: Detail uživatele
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/UserDto'
     *       404:
     *         description: Uživatel nenalezen
     */
    async getById(req: Request, res: Response) {
        const {id} = await validateParams(req, IdParam);
        const user = await userService.getById(id);

        if (user === null) {
            res.status(404).send();
            return;
        }

        res.status(200).send(user);
    }

    /**
     * @swagger
     * /users/{id}:
     *   put:
     *     summary: Upraví data uživatele (např. roli nebo jméno)
     *     tags: [Users]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/UserDto'
     *     responses:
     *       202:
     *         description: Uživatel upraven
     *       404:
     *         description: Uživatel nenalezen
     */
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

    /**
     * @swagger
     * /users/{id}:
     *   delete:
     *     summary: Smaže uživatele
     *     tags: [Users]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *     responses:
     *       204:
     *         description: Uživatel smazán
     */
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