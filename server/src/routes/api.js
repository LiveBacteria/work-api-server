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
// USE THIS ONE
router.get("/api/equipment-check-automation", apiController.equipmentCheckAutomation);

router.post("/api/testPost", (req, res) => {
    console.log(req.body)
    let credentials = {
      username: req.body.username,
      password: req.body.password
    };
    console.log(credentials.username);
    console.log(credentials.password);
    //credentials.username != "" && credentials.password != "" ? res.send({auth: "Authorised"}): res.send({auth: "Failed"});
    res.render("user/userLanding", credentials);

});

router.post("/api/getAssetInformation", apiController.getAssetInformation);

router.post("/api/redirectTest", (req, res, next) => {
    res.render("user/userLanding", {username: "T"})
});

router.get("/api/*", apiController.index);

module.exports = router;





