import { homepageController } from "./controllers/homepage/homepage.controller";
import { UserController } from "./controllers/users/user.controller";
import { CourseController } from "./controllers/courses/course.controller";
import { EnrollmentController } from "./controllers/enrollments/enrollment.controller";
import { NotificationController } from "./controllers/notifications/notification.controller";
import { CertificateController } from "./controllers/certificates/certificate.controller";
import { apiErrorHandler } from "../middleware/error.middleware";
import express = require("express");

export const server = express();

// Middleware to parse JSON and URL-encoded data
server.use(express.json());
server.use(express.urlencoded({ extended: true }));

// Homepage
server.get("/", homepageController.homepage);

// Users
const userController = new UserController();
server.get("/users", userController.getAll);
server.get("/users/:id", userController.getById);
server.post("/users", userController.create);
server.put("/users/:id", userController.update);
server.delete("/users/:id", userController.delete);

// Courses
const courseController = new CourseController();
server.post("/courses", courseController.create);
server.get("/courses", courseController.getAll);
server.get("/courses/:id", courseController.getById);
server.put("/courses/:id", courseController.update);
server.delete("/courses/:id", courseController.delete);

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

const certificateController = new CertificateController();
server.get("/certificates/:user_id/:course_id", certificateController.getUserCertificate); // stažení PDF certifikátu

// Middleware: Error handling
server.use(apiErrorHandler);