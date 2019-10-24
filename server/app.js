const express = require("express");
const app = express();

const appConfig = require("./src/config/main-config");
const routeConfig = require("./src/config/route-config");

appConfig.init(app, express);
routeConfig.init(app);

module.exports = app;