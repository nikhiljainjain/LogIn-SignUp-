//All packets
var express = require('express'),
    app = express(),
    //nodemailer = require('nodemailer'),
    mongoose = require('mongoose'),
    bodyParser = require('body-parser'),
    morgan = require('morgan'),
    cookieParser = require('cookie-parser')
    jwt = require('jsonwebtoken'),
    bcrypt = require('bcrypt'),
    faker = require('faker');
//All files
var config = require('./config'),
    Employee = require('./app/models/employee'),
    Log = require('./app/models/log'),
    Admin = require('./app/models/admin'),

app.listen(80, ()=>{
    console.log('Server started\nCode by\nNIKHIL JAIN');
});

var saltRounds = 9;

app.use(morgan('dev'));
app.use(cookieParser());

/*var transporter = nodemailer.createTransport({
    service : 'gmail',
    auth : {
        user : 'nikhil.jain2017@vitstudent.ac.in',
        pass : 'lravq16983'
    }
});*/

app.use(express.static('public'));

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

mongoose.connect(config.database, (err)=>{
    if (err){
        console.log(err);
        res.send(err);
    }
    console.log('Database connected');
});

app.set('superSecret', config.secret);

var tokenCheck = express.Router();

tokenCheck.use((req, res, next)=>{
    if (req.cookies.jsontoken){
        jwt.verify(req.cookies.jsontoken, app.get('superSecret'), (err, decode)=>{
            if (err){
                res.send('<h1>Please login again</h1>');
                console.log(err);
            }else {
                req.decoded = decode;
                next();
            }
        });
    }else {
        res.status(403).redirect('/');
    }
});

app.get('/', (req, res)=>{
    res.status(200).render('index.ejs', {title: 'Welcome'});
});

app.use('/user', tokenCheck);

app.post('/login', (req, res)=>{
    Employee.findOne({emailId: req.body.emailId}, (err, user)=>{
        if (err) {
            console.log(err);
            res.send(err);
        }if (!user){
            Admin.findOne({emailId: req.body.emailId}, (err, userAdmin)=>{
                  if (err){
                      console.log(err);
                      res.send(err);
                  }if (!userAdmin){
                      res.send('<h1>Email not found</h1>');
                  }else if (userAdmin){
                       var result = bcrypt.compareSync(req.body.password, userAdmin.password);
                      if (!result) {
                          res.status(200).render('forgetPassword.ejs', {title: 'Recover password'});
                      } else if (result) {
                          var payload = {
                              userName: userAdmin.userName,
                              emailId : userAdmin.emailId,
                          };
                          var token = jwt.sign(payload, app.get('superSecret'),
                               {expiresIn: '1h'});
                          res.status(200).render('adminLogin.ejs', {
                              title: 'Admin Login',
                              employees: userAdmin.employees,
                              userName: userAdmin.userName,
                              department: userAdmin.department,
                              token: token,
                          });
                          token = payload = undefined;
                      }
                  }
            });
        }else if (user){
            var result = bcrypt.compareSync(req.body.password, user.password);
            if (!result) {
                res.status(200).render('forgetPassword.ejs', {title: 'Recover Password'});
            } else if (result) {
                if (user.emailConfirmation) {
                    var payload = {
                        userName: user.userName,
                        emailId: user.emailId
                    };
                    var token = jwt.sign(payload, app.get('superSecret'),   {expiresIn: '1h'});
                    res.status(200).render('employeeLogin.ejs', {
                        title: 'Employee',
                        name: user.userName, work: user.work, token: token,
                    });
                    token = payload = undefined;
                }
                else {
                    res.send('Your email is not confirmed please check your email box');
                }
            }
            result = undefined;
        }
    });
});

app.get('/login', tokenCheck, (req, res)=>{
    Employee.findOne({emailId: req.decoded.emailId, userName: req.decoded.userName}, (err, result)=>{
        if (err){
            console.log(err);
            res.send('User not found<br>Login Again');
        }if (!result){
            Admin.findOne({emailId: req.decoded.emailId, userName: req.decoded.userName}, (err, userAdmin)=>{
                if (err){
                    console.log(err);
                    res.send('<h1>Something happen Error !!!<br>Login Again</h1>');
                }if (!userAdmin){
                    res.send('<h1>User not found<br>Please try again</h1>');
                }else if (userAdmin){
                    res.status(200).render('adminLogin.ejs', {
                        title: 'Admin Login',
                        employees: userAdmin.employees,
                        userName: userAdmin.userName,
                        department: userAdmin.department,
                        token: req.cookies.jsontoken
                    });
                }
            })
        }else if (result){
            res.status(200).render('employeeLogin.ejs', {
                title: 'Employee',
                name: result.userName,
                work: result.work,
                token: req.cookies.jsontoken
            });
        }
    })
})

app.post('/newUser', (req, res)=>{
    Employee.find({emailId : req.body.emailId}, (err, data)=> {
        if (err){
            console.log(err);
            res.send(err);
        }if (data.length !== 0) {
            res.send('This is email already register');
        } else {
            var employe = {userName: req.body.userName, password: req.body.password, emailId: req.body.emailId
            , hashCode: ''};
            employe.password = bcrypt.hashSync(req.body.password, saltRounds);
            var hashCodes = faker.hacker.phrase();
            employe.hashCode = bcrypt.hashSync(hashCodes, saltRounds);
            Employee.create(employe, (err, data) => {
                if (err){
                    console.log(err);
                    res.send(err);
                }else {
                    res.status(200).send('<h1>You are successfully register !!!</h1><br> Check your email box for confirmation');
                    /*var mailOptions = {
                        from : 'nikhil.jain2017@vitstudent.ac.in',
                        to : req.body.emailId,
                        subject : 'Email authencation',
                        html : "<p>Please click below link for authentication before going to start with us</p>" +
                        "<a href='/user/" + data._id+'/'+ hashCodes + "/emailConfirmation'><button>" +
                        "Click here</button></a>"
                    }
                    transporter.sendMail(mailOptions, (error, info)=>{
                        if (error){
                            console.log(error);
                            throw error;
                        }else{
                            console.log('Email send successfully '+ info.reponse);
                        }
                    });*/
                    //mailOptions = undefined;
                }
            });
            employe = hashCodes = undefined;
        }
    });
});

app.post('/forgetPassword', (req, res)=>{
    console.log(req.body);
    Employee.findOne({emailId: req.body.emailId}, (err, result) => {
        if (err){
            console.log(err);
        }if (result.length == 0){
            res.send("<br><h1>Em@il not found</h1>");
        }else {
            var password = faker.internet.password();
            Employee.findOneAndUpdate({emailId: req.body.emailId}, {forgotPassword: password}, (err)=>{
                if (err){
                    console.log(err);
                    res.send(err);
                }
            });
            /*var payload = {
                name : result.userName,
                email : result.emailId
            }
            var token = jwt.sign(payload, route.get('superSecret'), {
                expiresIn: '1h'});
            var mailData = {
                    from : 'authority emailId',
                    to : result.emailId ,//EMPLOYEE EMAIL ID
                    subject : 'password reset',
                    html : '<h3>Click on given link for recover password</h3><br>'
                     + "<a href='/recover/"+ password +'/'+token+"/'>"
                }
                transporter.sendMail(mailData, (err, info)=>{
                    if (err) throw err;
                    console.log(info);
                });
            payload = token = undefined;
            password = undefined;*/
        }
    });
});

app.get('/recover/:password', /*tokenCheck,*/ (req, res)=>{
    Employee.findOne({/*userName: req.decode.name, emailId: req.decode.email,*/
        forgotPassword: req.params.password}, (err, result) => {
        if (err){
            console.log(err);
            res.send(err);
        }if (result.length == 0) {
            res.send('Given link is not valid');
        } else {
            res.render('resetPassword.ejs', {id: result._id, title: 'Reset Passsword'});
        }
    });
});

route.post('/resetPassword/:id', (req, res)=>{
    Employee.findById(req.params.id, (err, result)=>{
        if (err){
            console.log(err);
        }if (result.length == 0){
            res.send('Not valid data');
        }else {
            req.body.password = bcrypt.hashSync(req.body.password, saltRounds);
            Employee.findByIdAndUpdate(req.params.id, {
                forgotPassword: 0,
                password: req.body.password
            }, (err) => {
                if (err){
                    console.log(err);
                    res.send(err);
                }if (result.length == 0){
                    res.send('Try again');
                }else{
                    res.send('Password change successfully');
                }
            });
        }
    });
});

app.get('/user/:id/:hashCode/emailConfirmation', (req, res)=>{
    Employee.find({_id: req.params.id}, (err, data)=>{
        if (err){
            console.log(err);
            throw err;
        }if (data.length == 0){
            res.send('You are not authorized please signup again');
        }else{
            var result = bcrypt.compareSync(req.params.hashCode, data.hashCode);
            if (!result){
                res.send('You have to signup again');
            } else if (result) {
                Employee.findByIdAndUpdate(req.params.id, {emailConfirmation: true}, (err) => {
                    if (err){
                        console.log(err);
                    }
                });
                res.redirect('/');
                /*var mailOptions = {
                   from : 'AUTHORITY EMAIL ID',
                   to : data.emailId,//EMPLOYEE EMAIL ID
                   subject : 'User authencation',
                   text : 'Email is confirmed for the user '+ data.userName + ' please check for authencation.'
               }
               transporter.sendMail(mailOptions, (error, info)=>{
                   if (error){
                       console.log(error);
                       throw error;
                   }else{
                       console.log('Email send successfully '+ info.reponse);
                   }
               })
               mailOptions = {
                   from : 'authority email id',
                   to : 'admin email id',
                   subject : 'detail of new user',
                   text : 'Here is detail of new user\n' +
                   +'Username: '+data.userName+'\nEmail: '+
                   data.emailId
               }
               transporter.sendMail(mailOptions, (error, info)=>{
                   if (error) throw error;
                   console.log(info);
               })
               mailOptions = undefined;*/
            }
        }
    });
});

app.get('/user/details', tokenCheck, (req, res)=>{
    res.send('<h1>You have a valid token<br>very nice</h1>');
});

app.get('/user/logout', tokenCheck, (req, res)=>{
    res.send('You successfully logout');
});

app.get('/logs', (req, res)=>{
    Log.find({}, (err, user)=>{
        if (err){
            console.log(err);
            throw err;
        }
        res.send(user);
    });
});

app.get('*', (req, res)=>{
    res.status(404).send("<h1>Error 404</h1><br><h3>File not Found</h3>");
});
