module.exports = function(app, dbManager) { 
    app.post("/api/authenticate/", function(req, res) {
        var seguro = app.get("crypto").createHmac("sha256", app.get("clave"))
        .update(req.body.password).digest("hex")

        var criterio = {
            email : req.body.email,
            password : seguro
        }

        dbManager.getUsers(criterio, function(usuarios) {
            console.log("rest buscando usuarios " + usuarios)
            if (usuarios == null || usuarios.length == 0) {
                res.status(401)
                res.json({autenticado : false})
            } else {
                console.log("rest encontro usuario")
                var token = app.get("jwt").sign({
                    usuario: criterio.email, tiempo: Date.now()/1000
                }, "secreto")
                req.session.user = req.body.email
                res.status(200)
                res.json({
                    autenticado: true,
                    token: token
                })
            }
        })
    })
    app.get("/api/friends", function(req, res) {
        console.log("rest searching friends...")
        // dbManager.getFriends( { $or: [ { source: req.session.user }, { target: req.session.user } ] }, function(friends) {
        dbManager.getFriends( {}, function(friends) {
            if (friends == null) {
                console.log("rest error searching friends")
                res.status(500)
                res.json({
                    error: "se ha producido un error"
                })
            } else {
                res.status(200)
                res.send(JSON.stringify(friends))
            }
        })
    })
    app.get("/api/messages", function(req, res) {
        console.log(req.session.user)
        let criteria = {
            $or: [
                {  
                    sender: req.session.user,
                    receiver: req.session.receiver
                },
                {  
                    sender: req.session.receiver,
                    receiver: req.session.user
                }
            ]}
        dbManager.getMessages(criteria, function(messages) {
            res.status(200)
            res.send(JSON.stringify(messages))
        })
    })
    app.post("/api/message", function(req, res) {
        let message = {
            receiver: req.session.receiver,
            sender: req.session.user,
            title: req.body.title,
            content: req.body.content,
            readed: false,
        }
        dbManager.addMessage(message, function(err) {
            res.status(201)
            res.json({ 
                mensaje: "message posted"
             })
            // if (err == null) {
            //     res.status(500)
            //     res.json({
            //         error: "error posting the message"
            //     })
            // } else {
            //     res.status(200)
            // }
        })
    })
    app.get("/api/chat/:email", function(req, res) {
        console.log("rest mensajes " + req.params.email)
        let email = req.params.email
        req.session.receiver = email.replace(":", "")    
        console.log(req.session.receiver)
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
            ]}
        dbManager.getMessages(criteria, function(msgs) {
            res.status(200)
            res.send(JSON.stringify(msgs))
        })        
    })
}
