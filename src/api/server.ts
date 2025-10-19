import {homepageController} from "./controllers/homepage/homepage.controller";
import {UserController} from "./controllers/users/user.controller";
import {apiErrorHandler} from "../middleware/error.middleware";
import express = require("express");

export const server = express();

// Middleware to parse JSON and URL-encoded data
server.use(express.json());
server.use(express.urlencoded({extended: true}));

// Homepage
server.get("/", homepageController.homepage);

// Aircrafts
const userController = new UserController();
server.get("/users", userController.getAll);
server.get("/users/:id", userController.getById);
server.post("/users", userController.create);
server.put("/users/:id", userController.update);
server.delete("/users/:id", userController.delete);

// Middleware: Error handling
server.use(apiErrorHandler);
