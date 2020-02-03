// This is where the requires go

const admin = require("firebase-admin");
const serviceAccount =require("../config/serviceAccountKey");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://cleanharbors-database.firebaseio.com"
});

const db = admin.database();

module.exports = {
    async getData(ref){
        let targetRef = db.ref(ref);
        let result = await targetRef.once("value", function(snapshot) {
            return snapshot.val();
        });
        return result;
    },
    async updateData(ref, data){
        let targetRef = db.ref(ref);
        await targetRef.set(data);
    },
    async createData(ref, data){

    },
    async removeData(ref, data, confirmation){
        if(confirmation === "DELETE DATA"){

        }
    }
};