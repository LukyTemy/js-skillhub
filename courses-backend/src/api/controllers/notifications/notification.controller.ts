import "reflect-metadata";
import { NotificationDto } from "../../../types/dto/notification.dto";
import { Request, Response } from "express";
import { notificationService } from "../../../services/notification.service";
import { validateBody, validateParams } from "../../../middleware/validation.middleware";
import { IdParam } from "../../../types/base.dto";

export class NotificationController {
    /**
     * @swagger
     * /notifications/user/{id}:
     *   get:
     *     summary: Získá všechny notifikace daného uživatele
     *     tags: [Notifications]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         schema:
     *           type: string
     *         required: true
     *         description: ID uživatele (MongoDB ObjectId)
     *     responses:
     *       200:
     *         description: Seznam notifikací uživatele
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 $ref: '#/components/schemas/NotificationDto'
     */
    async getByUser(req: Request, res: Response) {
        const { id } = await validateParams(req, IdParam);
        const notifications = await notificationService.getByUser(id);
        res.status(200).send(notifications);
    }

    /**
     * @swagger
     * /notifications/{id}/read:
     *   patch:
     *     summary: Označí notifikaci jako přečtenou
     *     tags: [Notifications]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         schema:
     *           type: string
     *         required: true
     *         description: ID notifikace (MongoDB ObjectId)
     *     responses:
     *       202:
     *         description: Notifikace označena jako přečtená
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/NotificationDto'
     *       404:
     *         description: Notifikace nenalezena
     */
    async markAsRead(req: Request, res: Response) {
        const { id } = await validateParams(req, IdParam);
        const existingNotification = await notificationService.getById(id);

        if (existingNotification === null) {
            res.status(404).send();
            return;
        }

        const notification = await notificationService.markAsRead(id);
        res.status(202).send(notification);
    }
}