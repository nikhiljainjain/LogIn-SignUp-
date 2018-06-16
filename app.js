var express = require('express'),
    app = express(),
    nodemailer = require('nodemailer'),
    mongoose = require('mongoose'),
    bodyParser = require('body-parser'),
    morgan = require('morgan'),
    jwt = require('jsonwebtoken'),
    config = require('./config'),
    Employee = require('./app/models/employee'),
    Log = require('./app/models/log'),
    Admin = require('./app/models/admin');

app.listen(80, ()=>{
    console.log('Server started');
})

app.use(morgan('dev'));
/*
var transporter = nodemailer.createTransport({
    service : 'gmail',
    auth : {
        user : 'myemailid',
        pass : 'password'
    }
})
*/
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

app.get('/', (req, res)=>{
    res.render('index.ejs');
})

app.post('/login', (req, res)=>{
    Employee.findOne({emailId: req.body.emailId}, (err, user)=>{
        if (err) throw err;
        if (!user){
            Admin.findOne({emailId: req.body.emailId}, (err, userAdmin)=>{
                  if (err) throw err;
                  if (!userAdmin){
                      res.send('Email not found');
                  }else if (userAdmin){
                      if (userAdmin.password != req.body.password){
                          res.send('Password not match');
                      }
                  }else {
                      const payload = {
                          userName : userAdmin.userName,
                          department : userAdmin.department
                      };
                      var token = jwt.sign(payload, app.get('superSecret'), {
                          expiresIn : '1h'
                      });
                      res.render('adminLogin.ejs', {employees: userAdmin.employees, userName: userAdmin.userName,
                          department: userAdmin.department, token: token});
                      //token = payload = undefined;
                  }
            })
        }else if (user){
            if (user.password != req.body.password){
                res.send('Authecation failed');
            }else {
                if (user.emailConfirmation) {
                    const payload = {
                        userName : user.userName
                    };
                    var token = jwt.sign(payload, app.get('superSecret'), {
                        expiresIn: '1h'
                    });
                    res.render('employeeLogin.ejs', {name: user.userName, work: user.work, token: token});
                    //token = payload = undefined;
                }
                else {
                    res.send('Your email is not confirme please check your email box');
                }
            }
        }
    })
})

app.post('/newUser', (req, res)=>{
    Employee.find({password: req.body.password}, (err, data)=>{
        if (err){
            console.log(err);
            throw err;
        }
        if (data.length !== 0) {
            res.send('You are not allow for this password');
        }else{
            Admin.find({password : req.body.password}, (err, data)=> {
                if (err) {
                    console.log(err);
                    throw err;
                }
                if (data.length !== 0) {
                    res.send('This password is not allowed');
                }else{
                    Employee.find({emailId : req.body.emailId}, (err, data)=>{
                    if (err) {
                        console.log(err);
                        throw err;
                    }if (data.length !== 0){
                        res.send('This is email already register');
                    }else {
                        var employe = {userName: req.body.userName, password: req.body.password, emailId: req.body.emailId, hashCode : (Math.random())*100000000000000};
                        Employee.create(employe, (err, data)=>{
                            if (err) {
                                console.log(err);
                                throw err;
                            }
                            console.log(data);
                            res.send('<h1>You are successfully register !!!</h1><br> Check your email box for confirmation');
                            /*var mailOptions = {
                                from : 'myemailId',
                                to : req.body.emailId,
                                subject : 'Email authencation',
                                html : "<p>Please click below link for authentication before going to start with us</p>" +
                                "<a href=/user/" + data._id/data.hashCode + "/emailConfimation>Click here </a>"
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
                        //employe = undefined;
                        }
                    })
                }
            })
        }
    })
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

app.get('/user/:id/:hashCode/emailConfimation', (req, res)=>{
    Employee.find({_id: req.params.id, hashCode: req.params.hashCode}, (err, data)=>{
        if (err){
            console.log(err);
            throw err;
        }if (data.length == 0){
            res.send('You are not authorized please check link again');
        }else{
            Employee.findByIdAndUpdate(req.params._id, {emailConfirmation: true}, (err)=>{
                if (err){
                    throw err;
                    console.log(err);
                }
            })
            res.redirect('/');
            /*var mailOptions = {
                from : 'myemailId',
                to : 'adminEmailId',
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
            })*/
        }
    })
})
