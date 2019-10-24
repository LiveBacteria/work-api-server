module.exports = {
    init(app){
        const staticRoutes = require("../routes/static");
        const apiRoutes = require("../routes/api");
        app.use(staticRoutes);
        app.use(apiRoutes);
    }
}