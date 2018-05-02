module.exports = {
    mongo : null,
    app : null,
    init : function(app, mongo) {
        this.mongo = mongo
        this.app = app
    },
    addUser : function(user, functionCallback) {
        this.mongo.MongoClient.connect(this.app.get('db'), function(err, db) {
            if (err) {
                console.log("Error " + err)
                functionCallback(null)
            } else {
                var collection = db.collection('users')
                collection.insert(user, function(err, result) {
                    if (err) {
                        console.log("Error " + err)
                        functionCallback(null)
                    } else {
                        functionCallback(result.ops[0]._id)
                    }
                    db.close()
                })
            }
        })
    },
    getUsers : function(criterio, functionCallback) {
        console.log("buscando usuarios")
        this.mongo.MongoClient.connect(this.app.get('db'), function(err, db) {
            console.log("conectando...")
            if (err) {
                console.log("error al conectarse")
                functionCallback(null)
            } else {
                var collection = db.collection('users')
                collection.find(criterio).toArray(function(err, result) {
                    if (err) {
                        console.log("error al buscar")
                        functionCallback(null)
                    } else if (result.length == 0) {
                        console.log("sin datos 1")
                        functionCallback(result)
                    } else {
                        console.log("encontro usuarios")
                        functionCallback(result)
                    }
                    db.close()
                })
            }
        })
    },
    getUsersPg : function(criterio, pg, functionCallback) {
        console.log("buscando usuarios")
        this.mongo.MongoClient.connect(this.app.get('db'), function(err, db) {
            console.log("conectando...")
            if (err) {
                console.log("error al conectarse")
                functionCallback(null)
            } else {
                var collection = db.collection('users')
                collection.count(function(err, count) {
                    collection.find(criterio).skip((pg-1)*4).limit(4).toArray(function(err, result) {
                        if (err) {
                            console.log("error al buscar")
                            functionCallback(null)
                        } else if (result.length == 0) {
                            console.log("sin datos 2")
                        } else {
                            console.log("encontro usuarios")
                            functionCallback(result, count)
                        }
                        db.close()
                    })
                })
            }
        })
    },
    sendFriendRequest : function(request, functionCallback) {
        this.mongo.MongoClient.connect(this.app.get('db'), function(err, db) {
            if (err) {

            } else {
                var collection = db.collection('requests')
                collection.insert(request, function(err, result) {
                    if (err) {
                        console.log("Error " + err)
                        functionCallback(null)
                    } else {
                        functionCallback(result.ops[0]._id)
                    }
                    db.close()
                })
            }
        })
    },
    acceptFriendRequest : function(request) {
        this.mongo.MongoClient.connect(this.app.get('db'), function(err, db) {
            if (err) {

            } else {
                //TODO: eliminamos la peticion ya que son amigos
                var collection = db.collection('friends')
                collection.insert(request)
            }
        })
    },
    getFriendRequestReceived : function(criterio, functionCallback) {
        this.mongo.MongoClient.connect(this.app.get('db'), function(err, db) {
            if (err) {
            } else {
                var collection = db.collection('requests')
                collection.find(criterio).toArray(function(err, result) {
                    if (err) {
                        console.log("error al buscar")
                        functionCallback(null)
                    } else if (result.length == 0) {
                        console.log("sin datos 3")
                        functionCallback(result)
                    } else {
                        console.log("encontro usuarios")
                        functionCallback(result)
                    }
                    db.close()
                })
            }
        })
    },
    getFriendRequestSended : function(criterio, functionCallback) {
        this.mongo.MongoClient.connect(this.app.get('db'), function(err, db) {
            if (err) { 
            } else {
                var collection = db.collection('requests')
                collection.find(criterio).toArray(function(err, result) {
                    if (err) {
                        console.log("error al buscar")
                        functionCallback(null)
                    } else if (result.length == 0) {
                        console.log("sin datos 4")
                    } else {
                        console.log("encontro usuarios")
                        functionCallback(result)
                    }
                    db.close()
                })
            }
        })
    },
    getFriends : function(criterio, functionCallback) {
        this.mongo.MongoClient.connect(this.app.get('db'), function(err, db) {
            if (err) {
            } else {
                var collection = db.collection('friends')
                collection.find(criterio).toArray(function(err, result) {
                    if (err) {
                        console.log("error al buscar")
                        functionCallback(null)
                    } else if (result.length == 0) {
                        console.log("sin datos 5")                        
                        functionCallback(result)
                    } else {
                        console.log("encontro usuarios")
                        functionCallback(result)
                    }
                    db.close()
                })
            }
        })
    },
    removeFriendRequestReceived : function(request) {
        this.mongo.MongoClient.connect(this.app.get('db'), function(err, db) {
            if (err) {
            } else {
                var collection = db.collection('requests')
                collection.remove(request)
            }
        })
    }
}