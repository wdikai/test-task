var express = require('express');
var cors = require('cors');
var path = require('path');
var bodyParser = require('body-parser');

module.exports = function(app) {
  app.use(cors());
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({
    extended: false
  }));
  app.use(function(req, res, next){
  	console.log('================================');
  	console.log('query ', req.query);
  	console.log('body ', req.body);
  	console.log('================================');
  	next();
  });
  app.use(express.static(path.join(__dirname, '../public')));
};
