import { homepageController } from "./controllers/homepage/homepage.controller";
import { UserController } from "./controllers/users/user.controller";
import { CourseController } from "./controllers/courses/course.controller";
import { EnrollmentController } from "./controllers/enrollments/enrollment.controller";
import { NotificationController } from "./controllers/notifications/notification.controller";
import { CertificateController } from "./controllers/certificates/certificate.controller";
import { apiErrorHandler } from "../middleware/error.middleware";
import express = require("express");
import cors from 'cors';
import {sendMail} from "../grpc/mail.client";

export const server = express();

// Middleware to parse JSON and URL-encoded data
server.use(express.json());
server.use(express.urlencoded({ extended: true }));

// Enable CORS for browser-based frontend (allow all origins by default).
// If you want to restrict origins in production, replace with specific origin(s).
server.use(cors({
    origin: process.env.CORS_ORIGIN
}))

// Temporary debug endpoint for sending email via nodemailer using
server.post("/debug/send-mail", async (req, res, next) => {
    try {
        const { to, subject, text } = req.body ?? {};

        if (!to || !subject || !text) {
            res.status(400).json({
                error: "Missing required fields: to, subject, text",
            });
            return;
        }

        const response = await sendMail({ to, subject, text });

        if (!response.success) {
            res.status(500).json({
                success: false,
                error: response.error ?? "Failed to send email",
            });
            return;
        }

        res.status(200).json({
            success: true,
            messageId: response.messageId,
        });
    } catch (err) {
        next(err);
    }
});


// Homepage
server.get("/", homepageController.homepage);

// Users
const userController = new UserController();
const certificateController = new CertificateController();
server.get("/users", userController.getAll);
server.get("/users/:id", userController.getById);
server.post("/users", userController.create);
server.put("/users/:id", userController.update);
server.delete("/users/:id", userController.delete);
server.get("/users/:id/certificates", certificateController.getByUser)

// Courses
const courseController = new CourseController();
server.post("/courses", courseController.create);
server.get("/courses", courseController.getAll);
server.get("/courses/:id", courseController.getById);
server.put("/courses/:id", courseController.update);
server.delete("/courses/:id", courseController.delete);
server.get("/instructors/:id/courses", courseController.getByInstructor);

// Courses - Lessons
server.post("/courses/:id/lessons", courseController.addLesson);
server.put("/courses/:id/lessons/:lessonId", courseController.updateLesson);
server.delete("/courses/:id/lessons/:lessonId", courseController.deleteLesson);

// Enrollments
const enrollmentController = new EnrollmentController();
server.post("/enrollments", enrollmentController.create);
server.get("/enrollments/:userId", enrollmentController.getByUser);
server.delete("/enrollments/:id", enrollmentController.delete);

// Notifications
const notificationController = new NotificationController();
server.get("/notifications/:id", notificationController.getByUser); // historie notifikací
server.put("/notifications/:id/read", notificationController.markAsRead); // označení jako přečtené

// Certificates
server.get("/certificates/:user_id/:course_id", certificateController.getUserCertificate); // stažení PDF certifikátu

// Middleware: Error handling
server.use(apiErrorHandler);