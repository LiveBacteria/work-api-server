const express = require("express");
const router = express.Router();
const apiController = require("../controllers/apiController");
const cors = require("cors");

router.options("*", cors());

router.post(`/api/login`, cors(), apiController.login);

router.post(`/api/select-task`, cors(), apiController.selectTask);

router.post("/api/content-page", cors(), apiController.contentPage);

router.post("/api/htmltopdf", cors(), apiController.htmltopdf);

router.post("/api/url-to-pdf", cors(), apiController.urlPDF);

router.post("/api/equipment_automation", cors(), apiController.equipmentAutomation);

//router.post("/api/url-to-pdf", cors(), apiController.urlToPDF);

router.get("/api/download/:vehicleId", apiController.download);

router.get("/api/testRoute", apiController.getDataTest);

router.get("/api/*", apiController.index);

module.exports = router;





