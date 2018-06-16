var mongoose = require('mongoose');

var logSchema = new mongoose.Schema({
    work:   Array({
        work: String,
        assignBy: String
    })
});

//var log = mongoose.model('logs', logSchema);
module.exports = mongoose.model('logs', logSchema);
