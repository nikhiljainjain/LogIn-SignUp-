var express = require('express'),
    app = express(),
    //nodemailer = require('nodemailer'),
    mongoose = require('mongoose'),
    bodyParser = require('body-parser'),
    morgan = require('morgan'),
    jwt = require('jsonwebtoken'),
    config = require('./config'),
    Employee = require('./app/models/employee'),
    Log = require('./app/models/log'),
    Admin = require('./app/models/admin'),
    bcrypt = require('bcrypt'),
    faker = require('faker');

app.listen(80, ()=>{
    console.log('Server started');
    console.log('App made by NIKHIL JAIN');
})

var saltRounds = 8;

app.use(morgan('dev'));

/*var transporter = nodemailer.createTransport({
    service : 'gmail',
    auth : {
        user : 'AUTHORITY EMAIL ID',
        pass : 'PASSWORD'
    }
})*/

app.use(express.static('public'));

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

mongoose.connect(config.database, (err)=>{
    if (err){
        console.log(err);
    }else{
        console.log('Database connected');
    }
})

app.set('superSecret', config.secret);

app.get('/', (req, res)=>{
    res.render('index.ejs');
})

app.post('/login', (req, res)=>{
    console.log(req.cookie)
    Employee.findOne({emailId: req.body.emailId}, (err, user)=>{
        console.log(user);
        if (err) throw err;
        if (!user){
            Admin.findOne({emailId: req.body.emailId}, (err, userAdmin)=>{
                  if (err) throw err;
                  console.log(userAdmin);
                  if (!userAdmin){
                      res.send('Email not found');
                  }else if (userAdmin){
                       var result = bcrypt.compareSync(req.body.password, userAdmin.password);
                      if (!result) {
                          res.render('forgetPassword.ejs', {title: 'Recover password'});
                      } else if (result) {
                          var payload = {
                              userName: userAdmin.userName,
                              emailId : userAdmin.emailId,
                              department: userAdmin.department,
                          };
                          var token = jwt.sign(payload, app.get('superSecret'),
                              {expiresIn: '1h'}, { algorithm: 'ES512'});
                          res.render('adminLogin.ejs', {employees: userAdmin.employees,
                              userName: userAdmin.userName,
                              department: userAdmin.department, token: token, title: 'Admin Login'
                          });
                          token = payload = undefined;
                      }
                      //});
                  }
            })
        }else if (user){
            var result = bcrypt.compareSync(req.body.password, user.password);
            if (!result) {
                res.render('forgetPassword.ejs', {title: 'Recover Password'});
            } else if (result) {
                if (user.emailConfirmation) {
                    var payload = {
                        userName: user.userName,
                        emailId: user.emailId
                    };
                    var token = jwt.sign(payload, app.get('superSecret'), {
                        expiresIn: '1h'}, { algorithm: 'ES512'});
                    res.render('employeeLogin.ejs', {
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
    })
})

app.post('/newUser', (req, res)=>{
    Employee.find({emailId : req.body.emailId}, (err, data)=> {
        if (err) throw err;
        if (data.length !== 0) {
            res.send('This is email already register');
        } else {
            var employe = {userName: req.body.userName, password: req.body.password, emailId: req.body.emailId
            , hashCode: ''};
            employe.password = bcrypt.hashSync(req.body.password, saltRounds);
            var hashCodes = faker.hacker.phrase();
            employe.hashCode = bcrypt.hashSync(hashCodes, saltRounds);
            Employee.create(employe, (err, data) => {
                if (err) throw err;
                console.log(data);
                res.send('<h1>You are successfully register !!!</h1><br> Check your email box for confirmation');
                /*var mailOptions = {
                    from :'AUTHORITY EMAIL',
                    to : req.body.emailId, //EMPLOYEE EMAIL ID
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
                })*/
                //mailOptions = undefined;
            })
        employe = hashCodes = undefined;
        }
    })
})

app.get('/user/:token/logout', (req, res)=>{
    res.redirect('/');
})

app.get('/logs', (req, res)=>{
    Log.find({}, (err, user)=>{s
        if (err){
            console.log(err);
            throw err;
        }
        res.send(user);
    })
})

app.get('/user/:id/:hashCode/emailConfirmation', (req, res)=>{
    Employee.find({_id: req.params.id}, (err, data)=>{
        if (err){
            console.log(err);
            throw err;
        }if (data.length == 0){
            res.send('You are not authorized please check link again');
        }else{
            var result = bcrypt.compare(req.body.hashCode, data.hashCode);
            if (!result){
                res.send('Try again later');
            } else if (result) {
                Employee.findByIdAndUpdate(req.params._id, {emailConfirmation: true}, (err) => {
                    if (err) throw err;
                })
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
                    text : 'Here is detail of new user\n' + data
                }
                transporter.sendMail(mailOptions, (error, info)=>{
                    if (error) throw error;
                    console.log(info);
                })
                mailOptions = undefined;*/
            }
        }
    })
})

app.post('/forgetPassword', (req, res)=>{
    /*if (req.body.token){
        jwt.verify(req.body.token, {algorithm: 'ES512'}, app.get('superSecret'), (err, decode) => {
            if (err){
                res.redirect('/');
                throw err;
            }else{
                req.decoded = decode;
            }
        })
    }else {*/
        Employee.findOne({emailId: req.body.emailId}, (err, result) => {
            if (err) throw err;
            if (result.length == 0){
                res.send("<br><h1 style='align: center'>Em@il not found</h1>");
            }else {
                var password = faker.internet.password();
                Employee.findOneAndUpdate({emailId: req.body.emailId}, {forgotPassword: password}, (err)=>{
                    if (err) throw err;
                })
                const payload = {
                    name : result.userName,
                    email : result.emailId
                }
                var token = jwt.sign(payload, app.get('superSecret'), {
                    expiresIn: '1h'}, { algorithm: 'ES512'});
                /*var mailData = {
                    from : 'authority emailId',
                    to : result.emailId ,//EMPLOYEE EMAIL ID
                    subject : 'password reset',
                    html : '<h3>Click on given link for recover password</h3><br>'
                     + "<a href='/recover/"+ password +'/'+token+"/'>"
                }
                transporter.sendMail(mailData, (err, info)=>{
                    if (err) throw err;
                    console.log(info);
                });*/
                password = undefined;
            }
        })
    //}
})

app.get('/recover/:password/:token', (req, res)=>{
    if (req.body.token) {
        jwt.verify(req.body.token, app.get('superSecret'), {expiresIn: '1h'},
            { algorithm: 'ES512'}, (err, decode)=>{
                Employee.findOne({userName: decode.name, emailId: decode.email,
                    forgotPassword: req.params.password}, (err, result) => {
                    if (err) throw err;
                    if (result.length == 0) {
                        res.send('Given link is not valid');
                    } else {
                        res.render('resetPassword.ejs', {id: req.params.id});
                    }
                })
        });
    }else {
        res.send("<br><h1 style='align: center'>Please regenerate your link</h1>")
    }
})

app.post('/resetPassword/:id', (req, res)=>{
    Employee.findById(req.params.id, (err, result)=>{
        if (err) throw err;
        if (result.length == 0){
            res.send('Not valid data');
        }else {
            Employee.findByIdAndUpdate(req.params.id, {
                forgotPassword: 0,
                password: hash
            }, (err) => {
                if (err) throw err;
            })
        }
    })
})

app.get('/test', (req, res) => {
    var token = req.body.token || req.query.token || req.header['x-access-token'];
    if (token){
        jwt.verify(token, {algorithm: 'ES512'}, app.get('superSecret'), (err, decode)=>{
            if (err){
                res.send('Your token is expired please login again');
            }else {
                req.decoded = decode;
            }
        })
    }else {
        res.status(403).redirect('/');
    }
})

app.get('*', (req, res)=>{
    res.send("<br><h1>Error 404</h1><br><h3>File not Found</h3>");
})
