require("dotenv").config();
const express = require("express");
const cors = require('cors');
const app = express();
const bodyParser = require('body-parser');
const request = require('request');
const htmlToImage = require('html-to-image');
const puppeteer = require("puppeteer");
//const browser = puppeteer.launch({headless: true});
const fs = require("fs");
const path = require("path");
const archiver = require("archiver");
const AdmZip = require('adm-zip');
const download = require("download");
const admin = require('firebase-admin');
const serviceAccount = require("../config/serviceAccountKey");
//console.log(process.env.firebaseApiKey.type);
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: "cleanharbors-api-database.appspot.com"
});
//const db = admin.database();

const bucket = admin.storage().bucket(`gs://cleanharbors-api-database.appspot.com/`);

/*
        const ref = db.ref("vehicle");
    let usersRef = ref.child("testVhicle-4032");
    usersRef.set({
        dvir: pdf
    });
 */

const port = process.env.PORT || 3000;
const apiUser = process.env.apiUser || "guest";

app.use(bodyParser.json({limit: '10mb', extended: true, type: `*/*`}));
app.use(bodyParser.urlencoded({extended: true, limit: '10mb', type: `*/*`}));
app.use(cors());

app.listen(port, () => {
    console.log(`Server is running and listening on port:${port}`);
    console.log(`Accessed by: ${apiUser}`);
});

app.get('/', (req, res) => {
    res.send("This server is not designed to be accessed directly.");
});

app.get('/test-page', (req, res) => {
    res.send("<div></div>");
});

app.get("/api/download/:vNum", (req, res) => {
    console.log(req.params.vNum);
    groupZip(req.params.vNum, res);
});

app.get('/login/', (req, res) => {
    const form = {content: `<div><p>Username</p><input type='text' id='loginEntry'></input></div><div><p>Password</p><input type='password' id='passwordEntry'></input></div><input type='submit' id='submitBtn' value='Submit'></input>`};
    res.send(form);
});

app.options('*', cors())
app.post('/api/login', cors(), (req, res) => {
    console.log("POST api/login called");
    console.log(req.body.user + " " + req.body.password);
    if(req.body.user == "Livebacteria" && req.body.password == "demoAuth"){
        res.send({key: "validated"});
        res.end();
    }else{
        res.send({key: "Failed!"});
        res.end();
}
});

app.post('/api/content-page', (req, res) => {
    if(req.body.auth == 'validated'){
        const html = {content: `<div class="container"><div><h1>DVIR Compiler</h1></div><div><h3 class='infoHeader'>Enter all log numbers below and hit start.</h3></div><button id="start_1">Start</button><button id="finish_1">Finished!</button><div><input id="dvirInput"></div></div>`};
        res.send(html);
    }
});

async function printPDF(htmlFile) {
    /*
    let htmlHeadContent = html.htmlHeadContent || "",
        htmlBodyContent = html.htmlBodyContent || "";
    let htmlComplete = htmlHeadContent.concat(htmlBodyContent);
     */
    const browser = await puppeteer.launch({headless: true});
    const page = await browser.newPage();
    //await page.goto(`data:text/html,${htmlComplete}`, {waitUntil: 'networkidle0'});
    //await page.goto(`file:///C:/Users/pooret1/cleanharbors-dvir-to-pdf-api-server/test.html`, {waitUntil: 'networkidle0'});
    //await page.goto(`data:text/html,${htmlComplete}`, {waitUntil: 'networkidle2'});
    await page.goto(htmlFile, {waitUntil: 'networkidle0'});
    console.log(page.url());
    const pdf = await page.pdf({format: 'A4'});
    await browser.close();
    return pdf;
}

groupZip = (vNum, res) => {
    const delay = (time) => new Promise((resolve) => setTimeout(resolve, time));

    bucket.getFiles({directory: `vehicle/${vNum}`},(err, files) => {
        if(!err){
            files.forEach(file => {
                let name = (file.id + "").split("%2F", 3);
                file.download({destination: `${path.resolve(__dirname, "..")}/output/pdf/${name[2]}`});
                //archive.file(`../output/pdf/${name}`,{name: name});
            });
            delay(500).then(() => {
                const output = fs.createWriteStream(`${path.resolve(__dirname, "..")}/output/zip/dvir.zip`);
                //const archive = archiver("zip");
                console.log("Starting zip file");

        //archive.pipe(output);

        //archive.directory(`${path.resolve(__dirname, "..")}/output/pdf/`, false);

        //archive.finalize();

        console.log("Zip finished");
        delay(50).then(() => {});
            }).then(() => {
                delay(20000).then(() => {
                    let zip = new AdmZip();
                    zip.addLocalFolder("./output/pdf/");
                    zip.writeZip("./output/zip/dvir.zip");
                }).then(() => delay(5000).then(() => {
                    res.download(`${path.resolve(__dirname, "..")}/output/zip/dvir.zip`);
                    deleteLocalCache()
                })).then(() => {
                    console.log("Cache Deleted");
                });
            });
        }else{
            console.log(err);
        }
    });
}

zipped = (res, pathToZip) => {
    /*
    res.setHeader('Content-Disposition', 'attachment');
    let fileStream = fs.createReadStream(pathToZip);
    fileStream.pipe(res);
     */
    res.download(`${path.resolve(__dirname, "..")}/output/zip/1file.zip`);
    console.log("Sent zip file for download!");
    const delay = (time) => new Promise((resolve) => setTimeout(resolve, time));
    //delay(3000).then(() => deleteLocalCache()).then(() => {
       // console.log("Cache Deleted");
    //});
}

deleteLocalCache = () => {
    fs.readdir(`./output/tempHTML/`, (err, files) => {
       if(err){
           throw err;
       }
       for(const file of files){
           fs.unlink(path.join("./output/tempHTML/", file), (err) => {
              if(err){
                  throw err;
              }
           });
       }
    });
    fs.readdir(`./output/pdf/`, (err, files) => {
        if(err){
            throw err;
        }
        for(const file of files){
            fs.unlink(path.join("./output/pdf/", file), (err) => {
                if(err){
                    throw err;
                }
            });
        }
    });
}

createFileName = (date, tripType, logNumber, type) => {
    let finalName = "dvir-";
    //finalName.concat((date.replace(/\//g, "-") + "." + type));
    date = date.replace(/\//g, "-");
    finalName = finalName.concat(`${date}-${tripType ? "pre" : "post"}-${logNumber}.${type}`);
    console.log(finalName);
    console.log("Current path is: " + `${path.resolve(__dirname, "..")}/output/`);
    return finalName;
}

app.options('*', cors());
app.post('/api/htmltopdf', cors(), (req, res) => {
    //console.error(`${path.resolve(__dirname, "..")}/output/zip/file.zip`);
    if(req.body.finished == "true" || req.body.finished == true){
        groupZip(req.body.vehicleNumber, res);
        res.redirect(`/api/download/${req.body.vehicleNumber}`);
        return;
    }

    console.log("POST /api/htmltopdf called");
    //console.log(`${path.resolve(__dirname, "..")}/output/${createFileName((req.body.htmlContent.dvirDate), "html")}`);

    let htmlHeadContent = req.body.htmlContent.htmlHeadContent || "",
        htmlBodyContent = req.body.htmlContent.htmlBodyContent || "";
    let htmlComplete = htmlHeadContent.concat(htmlBodyContent);

    //console.log(htmlComplete);

    fs.writeFile(`./output/tempHTML/${createFileName(req.body.htmlContent.dvirDate, req.body.htmlContent.dvirType, req.body.htmlContent.logNumber, "html")}`, htmlComplete, function(err) {

        if(err) {
            return console.log(err);
        }
    });
        printPDF(`file:${path.resolve(__dirname, "..")}/output/tempHTML/${createFileName(req.body.htmlContent.dvirDate, req.body.htmlContent.dvirType, req.body.htmlContent.logNumber, "html")}`).then((pdf) => {
            console.log(pdf);
            fs.writeFile(`./output/pdf/${createFileName(req.body.htmlContent.dvirDate, req.body.htmlContent.dvirType, req.body.htmlContent.logNumber, "pdf")}`, pdf, function (err) {
                if (err) {
                    return console.log(err);
                }
                const options = {
                  destination: `vehicle/${req.body.vehicleNumber}/${createFileName(req.body.htmlContent.dvirDate, req.body.htmlContent.dvirType, req.body.htmlContent.logNumber, "pdf")}`
                };
                bucket.upload(`./output/pdf/${createFileName(req.body.htmlContent.dvirDate, req.body.htmlContent.dvirType, req.body.htmlContent.logNumber, "pdf")}`, options);
                console.log("The file was saved!");
            });
            //res.set({'Content-Type': 'application/pdf', 'Content-Length': pdf.length});
            //res.send(pdf);
            res.end();
        }).catch((err) => {
            console.log(err);
            console.error("Error in getting pdfified page.");
            res.redirect("/");
        });
});
