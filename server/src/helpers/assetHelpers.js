

module.exports = {
    sortData(arr) {
        if (Array.isArray(arr)) {
            return arr.sort((a, b) => (a.unit + "".toUpperCase() > b.unit + "".toUpperCase()) ? 1 : -1);
        } else {
            alert("Error in sorting data!");
            console.error(arr);
        }
    },
    startCalls(unit, permArray) {
        let objInspectionHistorySearch = createInspectionObject(unit); //CreateAssetSearch();
        getInspectionList(objInspectionHistorySearch);
        permArray = sortData(permArray);
    },
    createInspectionObject(unit) {
        let obj = {};
        obj.unit = unit;
        obj.AssetCategory = "";
        obj.AssetTagNumber = ("" + unit).padStart(8, " ");
        obj.AssetTypeCode = "";
        obj.Branch = "";
        obj.DomainID = 1;
        obj.InspectionActionID = "";
        obj.InspectionAuthorityID = "";
        obj.InspectionDomainItemID = ("" + unit).padStart(8, " ");
        obj.InspectionFromDate = new Date(new Date().getTime() - 365 * 86400000);
        obj.InspectionStatus = "";
        obj.InspectionToDate = new Date();
        obj.PageIndex = 1;
        obj.PageSize = 100;
        obj.UserName = "POORET1";
        return obj;
    },
    getInspectionList(inspectionHistorySearch) {
        $.ajax({
            type: "POST",
            url: "http://winweb.cleanharbors.com/PMInspection/InspectionHistory.aspx/GetInspectionHistoryList",
            data: "{'inspectionHistorySearch':" + JSON.stringify(inspectionHistorySearch) + "}",
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            success: function(data){
                let tempObj = {};
                tempObj.unit = inspectionHistorySearch.unit;
                tempObj.data = data.d.InspectionHistoryList;
                tempObj.lastPMA = false;
                tempObj.lastANNUAL = false;
                tempObj.tankTest = [];
                try{
                    for(let x = 0; x < tempObj.data.length; x++){
                        if(tempObj.data[x].DynamicFormName.includes("PM Level A") && tempObj.lastPMA == false){
                            tempObj.lastPMA = tempObj.data[x].DisplayInspectionDate;
                            tempObj.lastPMA_ID = tempObj.data[x].ResponseId;
                        }else if(tempObj.data[x].InspectionActionName.includes("Annual") && tempObj.lastANNUAL == false){
                            tempObj.lastANNUAL = tempObj.data[x].DisplayInspectionDate;
                            tempObj.lastANNUAL_ID = tempObj.data[x].ResponseId;
                        }
                        if(tempObj.data[x].DynamicFormName.includes("Tank Test")){
                            if(new Date(tempObj.data[x].DisplayInspectionDate) > new Date(new Date().getTime() - 7 * 86400000)){
                                tempObj.tankTest.push(tempObj.data[x].DisplayInspectionDate);
                            }
                        }
                    }
                }catch{
                    console.log(tempObj);
                }
                permArray.push(tempObj);
            }
        });
    },

};