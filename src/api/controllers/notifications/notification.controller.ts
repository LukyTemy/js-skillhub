import "reflect-metadata";
import { NotificationDto } from "../../../types/dto/notification.dto";
import { Request, Response } from "express";
import { notificationService } from "../../../services/notification.service";
import { validateBody, validateParams } from "../../../middleware/validation.middleware";
import { IdParam } from "../../../types/base.dto";

export class NotificationController {
    async getByUser(req: Request, res: Response) {
        const { userId } = req.params;
        const notifications = await notificationService.getByUser(userId);
        res.status(200).send(notifications);
    }

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