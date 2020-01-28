const apiHelper = require("../helpers/apiHelper.js");

const fs = require("fs");
const path = require("path");
const request = require('request');
const puppeteer = require("puppeteer");

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
    selectTask(req, res, next){
        html = {content: `  <div class="container">
    <div>
      <h1>Select Task</h1>
    </div>
    <div>
      <h3 class='infoHeader'>Select a task from the dropdown below and press go</h3>
    </div>
    <div>
      <select id="taskSelectionDropdown_0">
        <option selected value="dvir_compiler">DVIR Compiler</option>
        <option value="dlog_compiler">DLOG Compiler</option>
        <option disabled value="recon">Auto-Recon</option>
      </select>
      <button id="taskSubmit">Go</button>
    </div>
  </div>`, auth: "validated"};
        html1 = {content: "<div>Hi</div>"};
        res.send(html)
    },
    contentPage(req, res, next){
        if(req.body.auth == "validated"){
            let html;
            switch(req.body.task){
                case 'dlog':
                    html = {content: `<div class="container"><div><h1>DVIR Compiler</h1></div><div><h3 class='infoHeader'>Enter all log numbers below and hit start.</h3></div><button id="start_1">Start</button><input id="vehicleId"><input id="dvirInput"></div></div>`};
                    break;
                case 'dvir':
                    console.log("DVIR SELSECTED");
                    html = {content: `<div class="container"><div><h1>DVIR Compiler</h1></div><div id='infoDisplay'><div><h3 class='infoHeader'>Enter all log numbers below and hit start.</h3></div><button id="start_1">Start</button><button id="clearFields">Clear</button><div><b>ID:</b><input id="vehicleId"></div><div><b>DVIR:</b><input id="dvirInput"></div></div></div>`};
                    break;
                default:
                    html = {content: `<div><h1>Error, no task given.</h1></div>`}
            }
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

        fs.writeFile(`${path.resolve(__dirname, "../..")}/output/tempHTML/${apiHelper.ensureDirExists(req.body.vehicleNumber, "tempHTML")}/${apiHelper.createFileName(req.body.htmlContent.dvirDate, req.body.htmlContent.dvirType, req.body.htmlContent.logNumber, "html")}`, htmlComplete, function(err){
           if(err){
               console.log(err);
           }
           apiHelper.helpPrintPdf(`${path.resolve(__dirname, "../..")}/output/tempHTML/${req.body.vehicleNumber}/${apiHelper.createFileName(req.body.htmlContent.dvirDate, req.body.htmlContent.dvirType, req.body.htmlContent.logNumber, "html")}`).then((pdf) => {
               //console.log((pdf));
               fs.writeFile(`${path.resolve(__dirname, "../..")}/output/pdf/${apiHelper.ensureDirExists(req.body.vehicleNumber, "pdf")}/${apiHelper.createFileName(req.body.htmlContent.dvirDate, req.body.htmlContent.dvirType, req.body.htmlContent.logNumber, "pdf")}`, pdf, function(err){
                   if(err){
                       console.log(err);
                       return;
                   }

                   const options = {
                       destination: `vehicle/${req.body.vehicleNumber}/${apiHelper.createFileName(req.body.htmlContent.dvirDate, req.body.htmlContent.dvirType, req.body.htmlContent.logNumber, "pdf")}`
                   };

                   //Removed due to possible security concern from work
                   //bucket.upload(`${path.resolve(__dirname, "../..")}/output/pdf/${apiHelper.createFileName(req.body.htmlContent.dvirDate, req.body.htmlContent.dvirType, req.body.htmlContent.logNumber, "pdf")}`, options);

                   console.log("The file was saved!");
               })
           })
        });
        res.end();
    },
    async urlPDF(req, res, next){
        const browser = await puppeteer.launch({headless: true});
        let logs = req.body.logs,
        url = req.body.url, isFinished = 0;
        for(let i = 0; i < logs.length; i++){

            if(!fs.existsSync(`${path.resolve(__dirname, "../..")}/output/pdf/${apiHelper.ensureDirExistsURL(req.body.vehicleNumber)}/${apiHelper.createFileNameURL(logs[i])}`)){
                apiHelper.urlPDF(`${url+logs[i]}`, browser).then((pdf) => {
                    fs.writeFile(`${path.resolve(__dirname, "../..")}/output/pdf/${apiHelper.ensureDirExistsURL(req.body.vehicleNumber)}/${apiHelper.createFileNameURL(logs[i])}`, pdf, async (err) => {
                        if (err) {
                            console.log(err);
                        }

                        console.log(`DVIR ${logs[i]} was saved!`);
                        isFinished++;
                        if (isFinished >= logs.length) {
                            console.log("Finished!");
                            await browser.close();
                        }
                    });
                });
                //res.status(200).send();
            }else{
                console.log("File exists - Skipping");
                await browser.close();
            }
        }
    },
    download(req, res, next){
        apiHelper.groupZip(req.body.vehicleNumber, res);
    },
    equipmentAutomation(req, res, next){

    }
};