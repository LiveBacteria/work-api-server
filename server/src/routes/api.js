const express = require("express");
const router = express.Router();
const apiController = require("../controllers/apiController");
const cors = require("cors");

router.options("*", cors());

router.post(`/api/login`, cors(), apiController.login);

router.post("/api/content-page", cors(), apiController.contentPage);

router.post("/api/htmltopdf", cors(), apiController.htmltopdf);

router.get("/api/download/:vehicleId", apiController.download);

router.get("/api/*", apiController.index);

module.exports = router;