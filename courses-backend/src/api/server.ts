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
import { authenticate, hasAnyRole } from "../middleware/auth.middleware";

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
server.get("/users", authenticate, userController.getAll);
server.get("/users/:id", authenticate, userController.getById);
server.post("/users", authenticate, userController.create);
server.put("/users/:id", authenticate, userController.update);
server.delete("/users/:id", authenticate, userController.delete);
server.get("/users/:id/certificates", authenticate, certificateController.getByUser)

// Courses
const courseController = new CourseController();
server.post("/courses", authenticate, hasAnyRole('instructor'), courseController.create);
server.get("/courses", authenticate, courseController.getAll);
server.get("/courses/:id", authenticate, courseController.getById);
server.put("/courses/:id", authenticate, courseController.update);
server.delete("/courses/:id", authenticate, courseController.delete);
server.get("/instructors/:id/courses", authenticate, courseController.getByInstructor);

// Courses - Lessons
server.post("/courses/:id/lessons", authenticate, courseController.addLesson);
server.put("/courses/:id/lessons/:lessonId", authenticate, courseController.updateLesson);
server.delete("/courses/:id/lessons/:lessonId", authenticate, courseController.deleteLesson);

// Enrollments
const enrollmentController = new EnrollmentController();
server.post("/enrollments", authenticate, enrollmentController.create);
server.get("/enrollments/:userId", authenticate, enrollmentController.getByUser);
server.delete("/enrollments/:id", authenticate, enrollmentController.delete);

// Notifications
const notificationController = new NotificationController();
server.get("/notifications/:id", authenticate, notificationController.getByUser); // historie notifikací
server.put("/notifications/:id/read", authenticate, notificationController.markAsRead); // označení jako přečtené

// Certificates
server.get("/certificates/:user_id/:course_id", authenticate, certificateController.getUserCertificate); // stažení PDF certifikátu

// Middleware: Error handling
server.use(apiErrorHandler);