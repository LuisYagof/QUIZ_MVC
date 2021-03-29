const express = require('express');
const ENV = require('dotenv').config();
const MongoClient = require('mongodb').MongoClient
const MONGOdb = process.env.MONGO
const optionsMongo = { useNewUrlParser: true, useUnifiedTopology: true }
const cors = require('cors')
const md5 = require('md5')
const jwt = require('jsonwebtoken');
const cryptoRS = require('crypto-random-string')

const server =  express()
const listenPort = process.env.PORT || 8080;

const staticFilesPath = express.static(__dirname + '/Public');
server.use(staticFilesPath);

server.use(express.urlencoded({extended:false}));
server.use(express.json());

server.use(cors())

// -------------------------------------LEVANTAR SERVIDOR

server.listen(listenPort,
    () => console.log(`Server started listening on ${listenPort}`))
    
// ---------------------------------SERVICIO DE ESTÁTICOS

let fileOptions = {
    root: __dirname + '/Public'
};

server.get('/login', (req,res,next) => {
    let fileName = 'login.html';
    res.sendFile(fileName, fileOptions);
});

server.get('/signup', (req,res) => {
    res.sendFile('index.html', fileOptions);
});

server.get('/admin', (req,res) => {
    res.sendFile('admin.html', fileOptions);
});

// ---------------------------------------------VALIDATION

const emailIsValid = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  
const passIsValid = (pass) => /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/.test(pass)


// ----------------------------------------------LOGIN

server.post('/login', (req, res) => {
    const USER = {
        email: req.body.email,
        pass: md5(req.body.pass)
    }
    if ( emailIsValid(req.body.email) && passIsValid(req.body.pass) ) {
        MongoClient.connect(MONGOdb, optionsMongo, (err, db) => {
            try {
                db.db("quiz")
                    .collection("teachers")
                    .findOne(USER, (err, result) => {
                        if (result == null){
                            res.status(401).json({
                                status: 401,
                                data: "Password and email do not match"
                            })
                            db.close()
                        } else {
                            let token = jwt.sign({email: USER.email}, result.secret, {expiresIn: 600})
                            res.status(200).json({
                                status: 200,
                                data: "Token sent",
                                url: "/admin",
                                token: token
                            })
                            db.close()
                        }
                    })
            } catch {
                res.status(500).json({
                    status: 500,
                    data: "There's a problem with the internal server. Try again later"
                })
            }
        })
    } else {
        res.status(406).json({
            status: 406,
            data: "Email invalid / Pass must contain minimum eight characters, at least one letter and one number"
        })
    }
})

// ----------------------------------------------READ

server.get('/questions', (req, res) => {
    try {
        let tokenArray = req.headers.authorization.split(" ")
        let decoded = jwt.decode(tokenArray[1])
        if (decoded.email) {
            MongoClient.connect(MONGOdb, optionsMongo, (err, db) => {
                try {
                    db.db("quiz")
                    .collection("teachers")
                    .findOne({email: decoded.email}, (err, result) => {
                        try {
                            let verified = jwt.verify(tokenArray[1], result.secret)
                                if (verified.email) {
                                    MongoClient.connect(MONGOdb, optionsMongo, (err, db) => {
                                            db.db("quiz")
                                            .collection("questions")
                                            .find({}).toArray( (err, result) => {
                                                    res.status(200).json({
                                                        data: result,
                                                        status: 200
                                                    })
                                                    db.close()
                                            })
                                    })
                                }
                            } catch {
                                res.status(401).json({
                                    data: "You're not authorized to see this content. Please try logging in again",
                                    ok: false,
                                    status: 401,
                                    url: '/login'
                                })
                            }
                        })
                } catch {
                    res.status(500).json({
                        data: "There's a problem with the internal server. Try again later",
                        ok: false,
                        status: 500
                    })
                }
            })
        }                 
    } catch {
        res.status(401).json({
            data: "You're not authorized to see this content. Please try logging in again",
            ok: false,
            status: 401,
            url: '/login'
        })
    }
})


// ---------------------------------------------------LOGOUT


server.put('/logout', (req, res) => {
    try {
        let newSecret = cryptoRS({length: 10, type: 'base64'})
        let tokenArray = req.headers.authorization.split(" ")
        let decoded = jwt.decode(tokenArray[1])
        if (decoded.email) {
            MongoClient.connect(MONGOdb, optionsMongo, (err, db) => {
                try {
                    db.db("quiz")
                        .collection("teachers")
                        .updateOne({email: decoded.email}, {$set: {secret: newSecret}}, (err, result) => {
                            if (err){
                                res.status(400).json({
                                    status: 400,
                                    data: "Fatal error-- Humans must be destroyed",
                                    ok: false
                                })
                                db.close()
                            } else {
                                res.status(200).json({
                                    status: 200,
                                    data: "Succesfully logged out",
                                    ok: true,
                                    url: '/login'
                                })
                                db.close()
                            }
                        })
                } catch {
                    res.status(500).json({
                        status: 500,
                        data: "There's a problem with the internal server. Try again later",
                        ok: false,
                    })
                }
            })
        }             
    } catch {
        res.status(401).json({
            status: 401,
            data: "You're already logged out",
            ok: false,
        })
    }
})

// ---------------------------------------------------ADD

server.post('/add', (req, res) => {
    const QUESTION = {
        qu: req.body.qu,
        an: req.body.an,
        ok: req.body.ok
    }

    MongoClient.connect(MONGOdb, optionsMongo, (err, db) => {
        try {
            db.db("quiz")
                .collection("questions")
                .insertOne(QUESTION, (err, result) => {
                    if (err){
                        res.status(400).json({
                            status: 400,
                            data: "Database error",
                        })
                        db.close()
                    } else {
                        res.status(200).json({
                            status: 200,
                            data: "Question added correctly",
                            url: "/admin"
                        })
                        db.close()
                    }
                })
        } catch {
            res.status(500).json({
                status: 500,
                data: "There's a problem with the internal server. Try again later"
            })
        }
    })
})

// -------------------------------------------------DELETE

server.delete('/delete', (req, res) => {
    try {
        MongoClient.connect(MONGOdb, optionsMongo, (err, db) => {
                db.db("quiz")
                    .collection("questions")
                    .deleteOne({qu: req.body.qu}, (err, result) => {
                        res.status(200).json({
                            status:200,
                            data: "Question was deleted correctly",
                            ok: true,
                            url: '/admin'
                        })
                        db.close()
                    })
        })
    } catch {
        res.status(500).json({
            status: 500,
            data: "There's a problem with the internal server. Try again later",
            ok: false,
            })
    }
})