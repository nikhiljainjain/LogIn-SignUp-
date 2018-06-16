var mongoose = require('mongoose');

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
    emailConfirmation : {
        type: Boolean,
        default: false
    },
    hashCode : String
})

//var employee = mongoose.model('employees', employeeSchema);
module.exports = mongoose.model('employees', employeeSchema);