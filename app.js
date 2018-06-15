var express = require('express'),
    app = express(),
    mongoose = require('mongoose'),
    bodyParser = require('body-parser'),
    session = require('express-session'),
    cookieParser = require('cookie-parser'),
    morgan = require('morgan'),
    jwt = require('jsonwebtoken'),
    config = require('./config'),
    User = require('./app/models/user');

app.listen(80, ()=>{
    console.log('Server started');
})

app.use(morgan('dev'));

app.use(express.static('public'));

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

mongoose.connect(config.database, (err)=>{
    if (err){
        console.log(err);
    }else{
        console.log('Database connected');
    }
})

app.set('superSecret', config.secret);

app.use(cookieParser());

app.get('/', (req, res)=>{
    res.render('index.ejs');
})

app.post('/login', (req, res)=>{
    console.log(req.body);
    res.send('you are login');
})

app.post('/newUser', (req, res)=>{
    console.log(req.body);
    res.end('nikhiljain');
})

/*var logSchema = new mongoose.Schema({
    work:   Array({
        work: String,
        assignBy: String
    })
});

var log = mongoose.model('logs', logSchema);

var  adminSchema = new mongoose.Schema({
    userName : String,
    password : String,
    department : String,
    emailId : String,
    employees : Array({
        name: String,
        work: String,
        email: String,
        workStatus: Boolean,
        deadLine: Date
    } )
})

var admin = mongoose.model('admins', adminSchema);

var employeeSchema = new mongoose.Schema({
    userName : String,
    password : String,
    emailId : String,
    forgotPassword : {
        type: Number,
        default: 0
    },
    work : Array({
        title: String,
        givenBy: String,
        status: Boolean,
        deadLine: Date
    }),
    authentication : Boolean,
    emailConfirmation : Boolean,
    hashCode : String
})

var employee = mongoose.model('employees', employeeSchema);*/

