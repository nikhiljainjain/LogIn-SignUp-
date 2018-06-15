var mongoose = require('mongoose');

var logSchema = new mongoose.Schema({
    work:   Array({
        work: String,
        assignBy: String
    })
});

//var log = mongoose.model('logs', logSchema);
module.exports = mongoose.model('logs', logSchema);

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

//var admin = mongoose.model('admins', adminSchema);
module.exports = mongoose.model('admins', adminSchema);

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

//var employee = mongoose.model('employees', employeeSchema);
module.exports = mongoose.model('employees', employeeSchema);