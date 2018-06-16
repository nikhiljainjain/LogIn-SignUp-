var mongoose = require('mongoose');

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
