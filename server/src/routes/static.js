const express = require("express");
const router = express.Router();
const path = require("path");
const staticController = require("../controllers/staticController");

router.get("/", staticController.index);

router.get("/login", staticController.login);

router.get("/landing", function(req, res){
    res.render("main/landing");
});

module.exports = router;