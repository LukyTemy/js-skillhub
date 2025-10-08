import express = require("express");

export const homepageController = {
    homepage(req: express.Request, res: express.Response) {
        res.sendStatus(200);
    },
};
