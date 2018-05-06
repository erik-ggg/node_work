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
    addMessage : function(message, functionCallback) {
        this.mongo.MongoClient.connect(this.app.get('db'), function(err, db) {
            if (err) {
                console.log("Error " + err)
                functionCallback(null)
            } else {
                var collection = db.collection('messages')
                collection.insert(message, function(err, result) {
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
    getUsers : function(criteria, functionCallback) {
        console.log("buscando usuarios")
        this.mongo.MongoClient.connect(this.app.get('db'), function(err, db) {
            console.log("conectando...")
            if (err) {
                console.log("error al conectarse")
                functionCallback(null)
            } else {
                var collection = db.collection('users')
                collection.find(criteria).toArray(function(err, result) {
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
    getUsersPg : function(criteria, pg, functionCallback) {
        console.log("buscando usuarios")
        this.mongo.MongoClient.connect(this.app.get('db'), function(err, db) {
            console.log("conectando...")
            if (err) {
                console.log("error al conectarse")
                functionCallback(null)
            } else {
                var collection = db.collection('users')
                collection.count(function(err, count) {
                    collection.find(criteria).skip((pg-1)*4).limit(4).toArray(function(err, result) {
                        if (err) {
                            console.log("error al buscar")
                            functionCallback(null)
                        } else if (result.length == 0) {
                            console.log("sin datos 2")
                            functionCallback(result, count)
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
                var collection = db.collection('requests')
                collection.remove(request, function(err, result) {
                    if(err) {
                        console.log("error removing the request")
                    } else {                        
                        var collection = db.collection('friends')
                        collection.insert(request)    
                    }
                    db.close()
                })            
            }
        })
    },
    getFriendsPg : function(criteria, pg, functionCallback) {
        this.mongo.MongoClient.connect(this.app.get('db'), function(err, db) {
            if (err) {
            } else {
                var collection = db.collection('friends')
                collection.count(function(err, count) {
                    collection.find(criteria).skip((pg-1)*4).limit(4).toArray(function(err, result) {
                        if (err) {
                            console.log("error searching friend requests!")
                            functionCallback(null)
                        } else if (result.length == 0) {
                            console.log("not founded friends!")
                            functionCallback(result, count)
                        } else {
                            console.log("founded friends!")
                            functionCallback(result, count)
                        }
                        db.close()
                    })
                })
            }
        })
    },
    getFriendRequestReceivedPg : function(criteria, pg, functionCallback) {
        this.mongo.MongoClient.connect(this.app.get('db'), function(err, db) {
            if (err) {
            } else {
                var collection = db.collection('requests')
                collection.count(function(err, count) {
                    collection.find(criteria).skip((pg-1)*4).limit(4).toArray(function(err, result) {
                        if (err) {
                            console.log("error searching friend requests!")
                            functionCallback(null)
                        } else if (result.length == 0) {
                            console.log("not founded friend requests!")
                            functionCallback(result, count)
                        } else {
                            console.log("founded friend requests!")
                            functionCallback(result, count)
                        }
                        db.close()
                    })
                })
            }
        })
    },
    getFriendRequestSended : function(criteria, functionCallback) {
        this.mongo.MongoClient.connect(this.app.get('db'), function(err, db) {
            if (err) { 
            } else {
                var collection = db.collection('requests')
                collection.find(criteria).toArray(function(err, result) {
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
    getFriends : function(criteria, functionCallback) {
        this.mongo.MongoClient.connect(this.app.get('db'), function(err, db) {
            if (err) {
            } else {
                var collection = db.collection('friends')
                collection.find(criteria).toArray(function(err, result) {
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
    getRequests : function(criteria, functionCallback) {
        this.mongo.MongoClient.connect(this.app.get('db'), function(err, db) {
            if (err) {
            } else {
                var collection = db.collection('requests')
                collection.find(criteria).toArray(function(err, result) {
                    if (err) {
                        console.log("error al buscar")
                        functionCallback(null)
                    } else if (result.length == 0) {
                        console.log("sin datos 5")                        
                        functionCallback(result)
                    } else {
                        console.log("founded requests!")
                        functionCallback(result)
                    }
                    db.close()
                })
            }
        })
    },
    getMessages : function(criteria, functionCallback) {
        this.mongo.MongoClient.connect(this.app.get('db'), function(err, db) {
            if (err) {
            } else {
                var collection = db.collection('messages')
                collection.find(criteria).toArray(function(err, result) {
                    if (err) {
                        console.log("error searching messages")
                        functionCallback(null)
                    } else if (result.length == 0) {
                        console.log("not founded messages")                        
                        functionCallback(result)
                    } else {
                        console.log("founded messages!")
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
                db.close()
            }
        })        
    }
}