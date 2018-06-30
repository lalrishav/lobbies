'use strict'
const express = require('express')
const app = express()
const path = require('path');
const fs = require("fs")
const flash = require('connect-flash');
const mysql = require("mysql");
var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database : 'csgopeer'
});
con.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
});

/*con.query("SELECT * FROM api_key", function (err, result) {
    if (err) throw err;
    console.log("Result: " + result);
});*/
//var mongoose = require("mongoose")
//mongoose.connect(process.env.MONGOLAB_URI|| "mongodb://localhost:27017/bitChatter" )
app.set('view engine','ejs');
app.set('views',path.join(__dirname,'views'));
app.use(express.static(path.join(__dirname, 'public')));
const session = require('express-session')
const bodyParser = require('body-parser')
app.use(bodyParser());
app.use(session({
	cookieName 	: 'session',
	secret	   	: 'asdfghjklpoiuytrewq',
}))
app.use(flash());
var server = require('http').createServer(app)
require('./routes.js')(app,con);
server.listen(process.env.PORT || 4200);









