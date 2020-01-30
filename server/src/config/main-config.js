require("dotenv").config();
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require("path");

module.exports = {
    init(app, express){
        app.use(bodyParser.json({limit: '10mb', extended: true, type: `*/*`}));
        app.use(bodyParser.urlencoded({extended: true, limit: '10mb', type: `*/*`}));
        app.set('view engine', 'ejs');
        app.set('views', path.join(__dirname, '../components/pages'));
        app.use(cors());
        app.options('*', cors())
    }
}
