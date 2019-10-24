const apiHelper = require("../helpers/apiHelper.js");

const fs = require("fs");
const path = require("path");
const request = require('request');

//Removed due to possible security concern from work
//const admin = require('firebase-admin');
//const bucket = admin.storage().bucket(/*Insert gs:/bucket Here*/);

module.exports = {
    index(req, res, next){
        res.redirect("/");
    },
    login(req, res, next){
        console.log("POST api/login called");
        console.log(req.body.user + " " + req.body.password);
        if(req.body.user == "Livebacteria" && req.body.password == "demoAuth"){
            res.send({key: "validated"});
            res.end();
        }else{
            res.send({key: "Failed!"});
            res.end();
        }
    },
    contentPage(req, res, next){
        if(req.body.auth == "validated"){
            const html = {content: `<div class="container"><div><h1>DVIR Compiler</h1></div><div><h3 class='infoHeader'>Enter all log numbers below and hit start.</h3></div><button id="start_1">Start</button><button id="finish_1">Finished!</button><div><input id="dvirInput"></div></div>`};
            res.send(html);
        }else{
            res.send({content: `<div class="container"><p>User not validated.</p><br/><p>Retry</p><br/><a href='#' onclick='window.location.reload(true);'>Submit</a></div>`});
        }
    },
    htmltopdf(req, res, next){
        if(req.body.finised == "true" || req.body.finished == true){
            apiHelper.groupZip(req.body.vehicleNumber, res);
            res.redirect(`/api/download/${req.body.vehicleNumber}`);
            return;
        }

        console.log("POST /api/htmltopdf called");

        let htmlHeadContent = req.body.htmlContent.htmlHeadContent || "",
            htmlBodyContent = req.body.htmlContent.htmlBodyContent || "";
        let htmlComplete = htmlHeadContent.concat(htmlBodyContent);

        fs.writeFile(`${path.resolve(__dirname, "../..")}/output/tempHTML/${apiHelper.createFileName(req.body.htmlContent.dvirDate, req.body.htmlContent.dvirType, req.body.htmlContent.logNumber, "html")}`, htmlComplete, function(err){
           if(err){
               console.log(err);
           }
           apiHelper.helpPrintPdf(`${path.resolve(__dirname, "../..")}/output/tempHTML/${apiHelper.createFileName(req.body.htmlContent.dvirDate, req.body.htmlContent.dvirType, req.body.htmlContent.logNumber, "html")}`).then((pdf) => {
               console.log((pdf));
               fs.writeFile(`${path.resolve(__dirname, "../..")}/output/pdf/${apiHelper.createFileName(req.body.htmlContent.dvirDate, req.body.htmlContent.dvirType, req.body.htmlContent.logNumber, "pdf")}`, pdf, function(err){
                   if(err){
                       console.log(err);
                       return;
                   }

                   const options = {
                       destination: `vehicle/${req.body.vehicleNumber}/${apiHelper.createFileName(req.body.htmlContent.dvirDate, req.body.htmlContent.dvirType, req.body.htmlContent.logNumber, "pdf")}`
                   }

                   //Removed due to possible security concern from work
                   //bucket.upload(`${path.resolve(__dirname, "../..")}/output/pdf/${apiHelper.createFileName(req.body.htmlContent.dvirDate, req.body.htmlContent.dvirType, req.body.htmlContent.logNumber, "pdf")}`, options);

                   console.log("The file was saved!");
               })
           })
        });
        res.end();
    },
    download(req, res, next){
        apiHelper.groupZip(req.body.vehicleNumber, res);
    }
}