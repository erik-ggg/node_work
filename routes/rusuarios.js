module.exports = function(app, swig, dbManager) {
    app.get("/register", function (req, res) {
        let response = swig.renderFile("views/register.html", {})
        res.send(response)
    });
    app.post("/register", function (req, res) {
        var criterio = {
            email : req.body.email
        }
        dbManager.getUsers(criterio, function(usuarios) {
            if (usuarios == null || usuarios.length == 0) {
                var secure = app.get("crypto").createHmac('sha256', app.get('clave'))
                .update(req.body.password).digest('hex')
                var user = {
                    email : req.body.email,
                    password : secure
                }
                dbManager.addUser(user, function(id) {
                    if (id == null) {
                        // console.log(usuario.email)
                        // console.log(usuario.password)
                        // res.redirect("/registrarse?mensaje=Error al registrar usuario")
                        console.log("Error adding user")
                    } else {
                        console.log("User added")
                        // res.redirect("/identificarse?mensaje=Nuevo usuario registrado")
                    }
                })
            } else {
                console.log("email already in use")
            }
        })

        
    });
    app.get("/login", function (req, res) {
        if (req.session.user != null || req.session.user == undefined) {
            let response = swig.renderFile("views/login.html", {})        
            res.send(response)
        } else {
            res.redirect("/home")
        }
    });
    app.post("/login", function (req, res) {
        var seguro = app.get("crypto").createHmac('sha256', app.get('clave'))
                .update(req.body.password).digest('hex')
        var criterio = {
            email : req.body.email,
            password : seguro
        }

        dbManager.getUsers(criterio, function(users) {
            if (users == null || users.length == 0) {
                // req.session.usuario = null
                // res.redirect("/identificarse" + "?mensaje=Email o password incorrecto" + "&tipoMensaje=alert-danger") 
                console.log("error al logear")
            } else {
                // req.session.usuario = users[0].email
                // res.redirect("/publicaciones")
                console.log("1 " + users)
                console.log("2 " + users[0].email)
                req.session.user = users[0].email
                res.redirect("/home")
            }
        })
    });
    app.get("/home", function (req, res) {
        var pg = parseInt(req.query.pg)
        if (req.query.pg == null) {
            pg = 1
        }   
        dbManager.getUsersPg({}, pg, function(users, total) {
            if (users == null) {
                res.send("Error while retrieving the users") 
            } else {
                var pgLast = total / 4
                if (total%4 > 0) {
                    pgLast = pgLast + 1
                }
                let response = swig.renderFile("views/home.html", {
                    users: users,
                    pgCurrent: pg,
                    pgLast: pgLast
                })
                res.send(response)
            }
        })
    });
}