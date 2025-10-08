import {homepageController} from "./controllers/homepage/homepage.controller";
import {AircraftController} from "./controllers/aircraft/aircraft.controller";
import {apiErrorHandler} from "../middleware/error.middleware";
import express = require("express");

export const server = express();

// Middleware to parse JSON and URL-encoded data
server.use(express.json());
server.use(express.urlencoded({extended: true}));

// Homepage
server.get("/", homepageController.homepage);

// Aircrafts
const aircraftController = new AircraftController();
server.get("/aircrafts", aircraftController.getAll);
server.get("/aircrafts/:id", aircraftController.getById);
server.post("/aircrafts", aircraftController.create);
server.put("/aircrafts/:id", aircraftController.update);
server.delete("/aircrafts/:id", aircraftController.delete);

// Middleware: Error handling
server.use(apiErrorHandler);
