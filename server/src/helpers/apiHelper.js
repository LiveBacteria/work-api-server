require("dotenv").config();
const fs = require("fs");
const path = require("path");
const request = require('request');
const puppeteer = require("puppeteer");
const AdmZip = require('adm-zip');
const download = require("download");
const papa = require("papaparse");
const database = require("../helpers/databaseHelper");
const assetHelper = require("../helpers/assetHelpers");

// console.log(papa.parse(`${path.resolve(__dirname, "./1.csv")}`))
//
// const file = fs.createReadStream(`${path.resolve(__dirname, "./1.csv")}`);
// var count = 0; // cache the running count
// papa.parse(file, {
//     worker: true, // Don't bog down the main thread if its a big file
//     step: function(result) {
//         console.log(result);
//     },
//     complete: function(results, file) {
//         console.log('parsing complete read', count, 'records.');
//     }
// });
// const PDFParser = require("pdf2json");
// let pdfParser = new PDFParser();
// pdfParser.on("pdfParser_dataError", errData => console.error(errData.parserError) );
// pdfParser.on("pdfParser_dataReady", pdfData => {
//     fs.writeFile(`${path.resolve(__dirname, "../../..")}/test.json`, JSON.stringify(pdfData), () => {});
// });
//
// pdfParser.loadPDF(`${path.resolve(__dirname, "../../..")}/report.pdf`);

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
    },
    async hosPayrollRecon(req, res){

    },
    async getAssetInformation(req, res){
        let targetRef = "assetInformation";
        let assetList = await database.getData(targetRef);

        res.send({"assets": assetList});
    },
    async updateAssetDVIR(){
        let targetRef = "assetInformation";
        let equipmentList = await database.getData(targetRef);
        equipmentList = equipmentList.val();

        let permArray = [];

        // Convert Object of Objects to Array of Objects
        equipmentList = Object.keys(equipmentList).map(function(key) {
            return equipmentList[key];
        });

        // Sorts the asset list by unit number converted to string lexically
        equipmentList = assetHelper.sortData(equipmentList);
        //equipmentList = equipmentList.splice(0, 1);

        // Login Credentials in the case that the app is run outside of the business intranet
        const credential  = {
            user: "pooret1",
            password: "Kotegawayui11!!"
        };

        let compiledDVIRArray = [];

        equipmentList.map(index => console.log(index.unit));

        for(let i = 0; i < equipmentList.length; i++){
            // Need to see if this can be written to use the below to save on memory!
            // Declare globally scoped puppeteer browser for the for loop
            const browser = await puppeteer.launch({headless: false});


            const url = "http://winweb.cleanharbors.com/Vehicle/VehicleTDSearch.aspx?SearchType=DVIR";
            const page = await browser.newPage();
            await page.goto(url, {waitUntil: 'networkidle0', timeout: 0});

            if(await page.evaluate(() => {return document.body.innerHTML.toString().includes("Web Login")})){ //Checks to see if login is required, and if so completes a login
                await page.type("#txtUserName", credential.user);
                await page.type("#txtPassword", credential.password);
                await page.click("#btnLogin");
                await page.waitForSelector('#ddlCorretcedDVIR', {
                    visible: true,
                });
            }

            console.log("Reached page.type txtVhcleNo");
            console.log(typeof equipmentList[i].unit);
            await page.type("#txtVhcleNo", equipmentList[i].unit+""); // sets the unit number to be equal to the current unit

            await page.evaluate(() => {
                $('#ddlCorretcedDVIR').attr('disabled', false);
                $("#ddlCorretcedDVIR").attr('selectedIndex', 0);
                document.querySelector("#ddlCondition").selectedIndex = 2; // selects `Requires Maintenance`

                // This absolutely must be changed to read from each DVIR and see if they are different from what is stored in the database!!!
                document.querySelector("#txtStartDate").value = "01/01/2020"; // sets the start date of the search to "01/01/2020" THIS WILL BE CHANGED!!!
                // This absolutely must be changed to read from each DVIR and see if they are different from what is stored in the database!!!

            });

            await page.click("#btnRetrieve"); // starts the search which reloads the page

            try {
                await page.waitForSelector('#LabelDVIRsearchResultCount', {
                    visible: true,
                });

                let skip = await page.evaluate(() => {
                    return document.body.innerHTML.toString().includes("No data found for the specified criteria.");
                });

                if(skip){ // Checks to see if dvir items exist or not
                    console.log("Skipped!");
                    await browser.close();
                    continue;
                }

                await page.waitForSelector('#gridViewDVIRsearch > tbody .Row0', {
                    visible: true,
                });
                try{
                    await page.waitForSelector('#gridViewDVIRsearch > tbody .Row1', {
                        visible: true,
                    });
                }catch(err){console.error(err);}

                // This is where we will rip the data from!! This is the finished page where the dvirs are.
                let data = await page.evaluate(() => {
                    let tempDVIRArray = [];
                    let target = $("#gridViewDVIRsearch > tbody > tr");
                    for(let index = 1; index < target.length; index++){
                        let tempObj = {
                            "logId": target[index].querySelectorAll("td")[1].innerText,
                            "inspectionDate": target[index].querySelectorAll("td")[2].innerText,
                            "unit": target[index].querySelectorAll("td")[3].innerText,
                            "isNeedsRepair": true,
                            "branch": target[index].querySelectorAll("td")[6].innerText,
                            "createByEmployeeID": target[index].querySelectorAll("td")[7].innerText,
                            "createByEmployeeName": target[index].querySelectorAll("td")[8].innerText,
                            "vehicleOdometer": target[index].querySelectorAll("td")[9].innerText,
                            "comment": target[index].querySelectorAll("td")[11].innerText,
                            "tripType": target[index].querySelectorAll("td")[12].innerText,
                            "atTimeOfLastCheck_DefectsCorrected": target[index].querySelectorAll("td")[13].innerText,
                            "createdBy": target[index].querySelectorAll("td")[18].innerText,
                            "dateCreated": target[index].querySelectorAll("td")[19].innerText,
                            "modifiedBy": target[index].querySelectorAll("td")[20].innerText,
                            "modifiedDate": target[index].querySelectorAll("td")[21].innerText,
                        };
                        tempDVIRArray.push(tempObj);
                    }
                    return tempDVIRArray;
                });

                // Adds the relevant unit number to the beginning of the dvir array as a means of easier identifying later
                data.unshift(equipmentList[i].unit);
                compiledDVIRArray.push(data);
                console.log(compiledDVIRArray);
                database.updateData("/dvirsUpdated/", compiledDVIRArray);
                await browser.close();
                // This is where we will rip the data from!! This is the finished page where the dvirs are.

            } catch(err) {
                await browser.close();
                // console.error("Error");
                // try{console.error(err);}catch{};
            }
        }

        // THIS mAY BREAK IT ALL!
        let checkInterval = setInterval(async() => {
            if(checkedArray.length === equipmentList.length){
                return compiledDVIRArray;
            }
        }, 1000);

        database.updateData("/dvirsUpdated/", compiledDVIRArray);
    }
};