require("dotenv").config();
const bodyParser = require('body-parser');
const cors = require('cors');

module.exports = {
    init(app, express){
        app.use(bodyParser.json({limit: '10mb', extended: true, type: `*/*`}));
        app.use(bodyParser.urlencoded({extended: true, limit: '10mb', type: `*/*`}));
        app.use(cors());
        app.options('*', cors())
    }
}
