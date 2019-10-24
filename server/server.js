const app = require("./app");
const http = require("http");

const port = process.env.PORT || "3000";
app.set("port", port);

const server = http.createServer(app);

server.listen(port);

server.on("listening", () => {
    console.log(`Server is listening for requests on port ${server.address().port}`);
});