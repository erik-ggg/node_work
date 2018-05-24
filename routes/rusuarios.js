module.exports = function(app, swig, dbManager) {
    app.get("/friends", function(req, res) {
        let criteria = { 
            $or: [
                {
                    source: req.session.user
                },
                {
                    target: req.session.user
                }
            ]
        }
        var pg = parseInt(req.query.pg)
        if (req.query.pg == null) {
            pg = 1
        }   
        dbManager.getFriendsPg(criteria, pg, function(users, total) {
            console.log("users " + users)
            if (users == null) {                
                res.send("Error while retrieving the users") 
            } else {
                for (let i = 0; i < users.length; i++) {
                    console.log(users[i])
                    if (users[i].target == req.session.user) {
                        users[i].target = users[i].source
                    }
                }
                var pgLast = total / 4
                if (total%4 > 0) {
                    pgLast = pgLast + 1
                }
                let response = swig.renderFile("views/friends.html", {
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
        var pg = parseInt(req.query.pg)
        if (req.query.pg == null) {
            pg = 1
        }  
        dbManager.getFriendRequestReceivedPg({ target: req.session.user }, pg, function(requests, total) {            
            var pgLast = total / 4
            if (total%4 > 0) {
                pgLast = pgLast + 1
            }
            let response = swig.renderFile("views/friendrequests.html", {
                users: requests,
                pgCurrent: pg,
                pgLast: pgLast
            })
            res.send(response)
        }) 
    })
    app.get("/requests/:email", function(req, res) {
        let criteria = {
            $or: [
                {  
                    sender: req.session.user,
                    receiver: req.params.email
                },
                {  
                    sender: req.params.email,
                    receiver: req.session.user
                }
            ]
        }
        let bname = ""
        dbManager.getFriends(criteria, function(users) {
            if (users == null || users.length == 0 || users == undefined) {
                criteria = {
                    email: req.params.email
                }
                dbManager.getUsers(criteria, function(user) {
                    if (user == null || user.length == 0 || user == undefined) {
                        console.log("error! user with email " + req.params.email + " not found")
                    } else {
                        bname = user[0].name
                        var request = {
                            sname: bname,
                            source: req.params.email,
                            tname: req.session.name,
                            target: req.session.user
                        }
                        dbManager.acceptFriendRequest(request)        
                        res.redirect("/requests")
                    }
                })                
            } else {
                console.log("error! user is already friend!")    
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
                            res.redirect("/home")
                        }
                    })
                } else {
                    console.log("email already in use")
                }
            })
        } else {
            res.redirect("/register?msg=Password mismatch" + "&msgType=alert-danger")
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
                res.redirect("/login?msg=Error login" + "&msgType=alert-danger")
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