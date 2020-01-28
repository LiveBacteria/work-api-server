require("dotenv").config();
const fs = require("fs");
const path = require("path");
const request = require('request');
const puppeteer = require("puppeteer");
const AdmZip = require('adm-zip');
const download = require("download");

const PDFParser = require("pdf2json");
let pdfParser = new PDFParser();

pdfParser.on("pdfParser_dataError", errData => console.error(errData.parserError) );
pdfParser.on("pdfParser_dataReady", pdfData => {
    fs.writeFile(`${path.resolve(__dirname, "../../..")}/test.json`, JSON.stringify(pdfData), () => {});
});

pdfParser.loadPDF(`${path.resolve(__dirname, "../../..")}/report.pdf`);

//To be added in ELD - APR Recon Update
//const extract = require('pdf-text-extract');
// extract(`${path.resolve(__dirname, "../../..")}/report.pdf`, function (err, pages) {
//     if (err) {
//         console.dir(err)
//         return
//     }
//     console.dir(pages[1]);
// });

//Removed due to possible security concern from work
// const admin = require('firebase-admin');
// const serviceAccount = require("../config/serviceAccountKey");
//
// admin.initializeApp({
//     credential: admin.credential.cert(serviceAccount),
//     storageBucket: "cleanharbors-api-database.appspot.com"
// });
//
// const bucket = admin.storage().bucket(`gs://cleanharbors-api-database.appspot.com/`);

async function printPdf(htmlFile) {
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

async function savePdf(url, browser) {
    const page = await browser.newPage();
    await page.goto(url, {waitUntil: 'networkidle0', timeout: 0});
    const pdf = await page.pdf({format: 'A4'});
    await page.close();
    return pdf;
}

module.exports = {
    createFileName(date, tripType, logNumber, type){
        let finalName = "dvir-";
        //finalName.concat((date.replace(/\//g, "-") + "." + type));
        date = date.replace(/\//g, "-");
        finalName = finalName.concat(`${date}-${tripType ? "pre" : "post"}-${logNumber}.${type}`);
        //console.log(finalName);
        //console.log("Current path is: " + `${path.resolve(__dirname, "../..")}/output/`);
        return finalName;
    },
    createFileNameURL(logNumber){
        let finalName = "dvir-";
        //date = date.replace(/\//g, "-");
        finalName = finalName.concat(`${logNumber}.pdf`);
        return finalName;
    },
    ensureDirExists(vehicleNumber, type){
        dirPath = `${path.resolve(__dirname, "../..")}/output/${type}/${vehicleNumber}`;

        try{
            fs.mkdirSync(dirPath);
        } catch{
        }

        if(fs.existsSync(dirPath)){
            return vehicleNumber;
        }else{
            if(mkdirs(path.dirname(dirPath))){
                fs.mkdirSync(dirPath);
                return vehicleNumber;
            }
        }
    },
    ensureDirExistsURL(vehicleNumber){
        dirPath = `${path.resolve(__dirname, "../..")}/output/pdf/${vehicleNumber}`;

        try{
            fs.mkdirSync(dirPath);
        } catch{
        }

        if(fs.existsSync(dirPath)){
            return vehicleNumber;
        }else{
            if(mkdirs(path.dirname(dirPath))){
                fs.mkdirSync(dirPath);
                return vehicleNumber;
            }
        }
    },
    deleteLocalCache(){
        fs.readdir(`${path.resolve(__dirname, "../..")}/output/tempHTML/`, (err, files) => {
            if(err){
                throw err;
            }
            for(const file of files){
                fs.unlink(`${path.resolve(__dirname, "../..")}/output/tempHTML/${file}`, (err) => {
                    if(err){
                        throw err;
                    }
                });
            }
        });
        fs.readdir(`${path.resolve(__dirname, "../..")}/output/pdf/`, (err, files) => {
            if(err){
                throw err;
            }
            for(const file of files){
                fs.unlink(`${path.resolve(__dirname, "../..")}/output/pdf/${file}`, (err) => {
                    if(err){
                        throw err;
                    }
                });
            }
        });
        fs.unlink(`${path.resolve(__dirname, "../..")}/output/zip/dvir.zip`, (err) => {
            if(err){
                throw err;
            }
        });
    },
    zipped(res, pathToZip){
        res.download(`${path.resolve(__dirname, "..")}/output/zip/1file.zip`);
        console.log("Sent zip file for download!");
        const delay = (time) => new Promise((resolve) => setTimeout(resolve, time));
    },
    groupZip(vNum, res){
        const delay = (time) => new Promise((resolve) => setTimeout(resolve, time));

        //Removed due to possible security concern from work
        // bucket.getFiles({directory: `vehicle/${vNum}`},(err, files) => {
        //     if(!err){
        //         files.forEach(file => {
        //             let name = (file.id + "").split("%2F", 3);
        //             file.download({destination: `${path.resolve(__dirname, "..")}/output/pdf/${name[2]}`});
        //             //archive.file(`../output/pdf/${name}`,{name: name});
        //         });
        //         delay(500).then(() => {
        //             const output = fs.createWriteStream(`${path.resolve(__dirname, "..")}/output/zip/dvir.zip`);
        //             //const archive = archiver("zip");
        //             console.log("Starting zip file");
        //
        //             //archive.pipe(output);
        //
        //             //archive.directory(`${path.resolve(__dirname, "..")}/output/pdf/`, false);
        //
        //             //archive.finalize();
        //
        //             console.log("Zip finished");
        //             delay(50).then(() => {});
        //         }).then(() => {
        //             delay(20000).then(() => {
        //                 let zip = new AdmZip();
        //                 zip.addLocalFolder("./output/pdf/");
        //                 zip.writeZip("./output/zip/dvir.zip");
        //             }).then(() => delay(5000).then(() => {
        //                 res.download(`${path.resolve(__dirname, "..")}/output/zip/dvir.zip`);
        //                 deleteLocalCache()
        //             })).then(() => {
        //                 console.log("Cache Deleted");
        //             });
        //         });
        //     }else{
        //         console.log(err);
        //     }
        // });

        delay(500).then(() => {
            let zip = new AdmZip();
            zip.addLocalFolder(`${path.resolve(__dirname, "../..")}/output/pdf/`);
            zip.writeZip(`${path.resolve(__dirname, "../..")}/output/zip/dvir.zip`);
        }).then(() => {
           delay(5000).then(() => {
               res.download(`${path.resolve(__dirname, "../..")}/output/zip/dvir.zip`);
               delay(3000).then(() => {
                  this.deleteLocalCache();
                  console.log("Cache Deleted");
               });
           })
        });
    },
    helpPrintPdf(htmlFile){
        return printPdf(htmlFile);
    },
    urlPDF(url, browser, vehicleNumber){
        return savePdf(url, browser);
    }
};