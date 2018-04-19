var express = require("express")
var app = express()
var bodyParser = require('body-parser')
var swig = require('swig')
var mongo = require('mongodb')
var fileUpload = require('express-fileupload')
var crypto = require('crypto')
var expressSession = require("express-session")
var jwt = require("jsonwebtoken")

app.use(expressSession ({
    secret : "abcdefg",
    resave : true,
    saveUninitialized : true
}))
app.use(fileUpload())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended:true}))
app.use(express.static('public'))
app.set("jwt", jwt)
app.set('clave', 'abcdefg')
app.set('crypto', crypto)
app.set('port', 8081)
app.set('db', 'mongodb://root:root@ds259268.mlab.com:59268/node_work')
let dbManager = require("./modules/dbManager.js")
dbManager.init(app, mongo)

var routerLoggedUser = express.Router()
routerLoggedUser.use(function(req, res, next) {
    if (req.session.user) {
        next()
    } else {
        res.redirect("/login")
    }
})

app.use("/home", routerLoggedUser)

require("./routes/rusuarios")(app, swig, dbManager)

app.listen(app.get('port'), function() {
    console.log("Servidor activo en " + app.get("port"))
})