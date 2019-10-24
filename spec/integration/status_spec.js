const request = require("request");
const server = require("../../server/server");
const base = "http://localhost:3000/";

describe("routes : static", () => {
   describe("GET /", () => {
       it("should return status code 200", (done) => {
          request.get(base, (err, res, body) => {
              expect(res.statusCode).toBe(200);
              done();
           })
       });
   });
});

describe("routes : api", () => {
    describe("GET /login", () => {
        it("should return status code 200 and provide a html form", (done) => {
            request.get(`${base}login`, (err, res, body) => {
                expect(res.statusCode).toBe(200);
                expect(body).toContain("Username");
                done();
            });
        });
    });
});