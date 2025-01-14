const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');

const db = require('./routes/db-config');
const port = 5000;

// express app
const app = express();

// set view engine
app.set('view engine', 'ejs');
app.set('views', './views');

app.use(cookieParser());
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: false }));

app.use(express.static(__dirname + '/public'));


// connect to mysql
db.connect((error) => {
    if (error) {
        console.log(error);
    } else {
        console.log('MYSQL Connected!');
    }
});

// upload image

// routes
app.use('/', require('./routes/pages'));

app.use('/api', require('./controllers/auth/userAuth'));

// app.use('/api', require('./controllers/custodian/authFolder/custodianAuth'));
// app.use('/api', require('./controllers/student/studAuthFolder/auth'));

app.use('/api', require('./controllers/student/rentRequest'));
app.use('/api', require('./controllers/custodian/custodianCRUD'));


app.listen(port,  () => {
    console.log(`server started on port ${port}`);
});

