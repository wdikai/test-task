var express = require('express');
var app = express(); 


require('./config/expressConfiguration')(app);
require('./routes/')(app);

module.exports = app;