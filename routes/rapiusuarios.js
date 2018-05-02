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
}
