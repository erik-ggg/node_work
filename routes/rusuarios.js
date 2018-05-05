module.exports = function(app, swig, dbManager) {
    app.get("/friends", function(req, res) {
        let criteria = { 
            email: { $ne: req.session.user } 
        }
        let search_param = req.query.semail
        if (search_param != null && search_param != undefined && search_param != "") {
            criteria = { 
                $and: [
                    { email: { $ne: req.session.user } },
                    { $or: [
                        { email: { $regex : ".*" + search_param + ".*" } },
                        { name: { $regex : ".*" + search_param + ".*" } 
                    }] 
                }]                
            }
        }
        var pg = parseInt(req.query.pg)
        if (req.query.pg == null) {
            pg = 1
        }   
        dbManager.getUsersPg(criteria, pg, function(users, total) {
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
    })
    app.get("/logout", function(req, res) {
        req.session.user = ""
        res.redirect("/login")
    })
    app.get("/requests", function(req, res) {
        dbManager.getFriendRequestReceived({ target: req.session.user }, function(requests) {            
            let response = swig.renderFile("views/friendrequests.html", {
                users: requests
            })
            res.send(response)
        })
    })
    app.get("/requests/:email", function(req, res) {
        let criteria = {
            email: req.params.email
        }
        let bname = ""
        dbManager.getFriends(criteria, function(users) {
            if (users == null || users.length == 0 || users == undefined) {
                console.log("error! user is already friend!")    
                res.redirect("/requests")
            } else {
                bname = users[0].name
                var request = {
                    sname: req.session.name,
                    source: req.session.user,
                    tname: bname,
                    target: req.params.email
                }                
                dbManager.acceptFriendRequest(request)        
                res.redirect("/requests")
            }
        })
    })
    app.get("/home/:email", function(req, res) {
        let criteria = {
            source: req.session.user,
            target: req.params.email
        }
        dbManager.getRequests(criteria, function(requests) {
            if (requests == undefined || requests == null || requests.length == 0) {
                criteria = {
                    $or: [
                        { 
                            source: req.session.user,
                            target: req.params.email 
                        },
                        {
                            source: req.params.email,
                            target: req.session.user 
                        }
                    ]
                }
                dbManager.getFriends(criteria, function(friends) {
                    criteria = {
                        email: req.params.email
                    }
                    if (friends == undefined || friends == null || friends.length == 0) {
                        let bname = ""
                        dbManager.getUsers(criteria, function(users) {
                            if (users == null || users.length == 0) {
                            } else {
                                bname = users[0].name
                                var request = {
                                    sname: req.session.name,
                                    source: req.session.user,
                                    tname: bname,
                                    target: req.params.email
                                }
                                dbManager.sendFriendRequest(request, function(id) {
                                    if (id == null) {
                                        // console.log(usuario.email)
                                        // console.log(usuario.password)
                                        // res.redirect("/registrarse?mensaje=Error al registrar usuario")
                                        console.log("Error sending request")
                                    } else {
                                        console.log("Request sended")
                                        // res.redirect("/identificarse?mensaje=Nuevo usuario registrado")
                                    }
                                })
                            }
                        })
                    }  
                    else {
                        console.log("error! user is already a friend!")
                    }   
                })                   
            } else {
                console.log("error! friend request already sended!")
            }
            res.redirect("/home")
        })
    })
    app.get("/register", function (req, res) {
        let response = swig.renderFile("views/register.html", {})
        res.send(response)
    });
    app.post("/register", function (req, res) {
        if (req.body.password == req.body.rpassword) {
            var criteria = {
                email : req.body.email
            }
            dbManager.getUsers(criteria, function(usuarios) {
                if (usuarios == null || usuarios.length == 0) {
                    var secure = app.get("crypto").createHmac('sha256', app.get('clave'))
                    .update(req.body.password).digest('hex')
                    var user = {
                        name : req.body.name,
                        email : req.body.email,
                        password : secure
                    }
                    dbManager.addUser(user, function(id) {
                        if (id == null) {
                            // console.log(usuario.email)
                            // console.log(usuario.password)                            
                            console.log("Error adding user")
                        } else {
                            console.log("User added")
                            req.session.name = req.body.name
                            req.session.user = req.body.email
                        }
                    })
                } else {
                    console.log("email already in use")
                }
            })
        } else {
            res.redirect("/register?msg=Password mismatch.")
        }       
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
        var criteria = {
            email : req.body.email,
            password : seguro
        }

        dbManager.getUsers(criteria, function(users) {
            if (users == null || users.length == 0) {
                // req.session.usuario = null
                // res.redirect("/identificarse" + "?mensaje=Email o password incorrecto" + "&tipoMensaje=alert-danger") 
                console.log("error al logear")
            } else {
                // req.session.usuario = users[0].email
                // res.redirect("/publicaciones")
                // console.log("1 " + users)
                // console.log("2 " + users[0].email)
                // console.log("3 " + users[0]._id)
                req.session.name = users[0].name
                req.session.user = users[0].email
                res.redirect("/home")
            }
        })
    });
    app.get("/home", function (req, res) {
        let criteria = { 
            email: { $ne: req.session.user } 
        }
        let search_param = req.query.semail
        if (search_param != null && search_param != undefined && search_param != "") {
            criteria = { 
                $and: [
                    { email: { $ne: req.session.user } },
                    { $or: [
                        { email: { $regex : ".*" + search_param + ".*" } },
                        { name: { $regex : ".*" + search_param + ".*" } 
                    }] 
                }]                
            }
        }
        var pg = parseInt(req.query.pg)
        if (req.query.pg == null) {
            pg = 1
        }   
        dbManager.getUsersPg(criteria, pg, function(users, total) {
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