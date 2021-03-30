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
    res.sendFile('login.html', fileOptions);
});

server.get('/', (req,res) => {
    res.sendFile('index.html', fileOptions);
});

server.get('/admin', (req,res) => {
    res.sendFile('admin.html', fileOptions);
});

server.get('/test', (req,res) => {
    res.sendFile('main.html', fileOptions);
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
                                data: "Contraseña y email no coinciden"
                            })
                            db.close()
                        } else {
                            let token = jwt.sign({email: USER.email}, result.secret, {expiresIn: 600})
                            res.status(200).json({
                                status: 200,
                                data: "Token enviado",
                                url: "/admin",
                                token: token
                            })
                            db.close()
                        }
                    })
            } catch {
                res.status(500).json({
                    status: 500,
                    data: "Hay un problema en nuestro servidor. Inténtalo más tarde"
                })
            }
        })
    } else {
        res.status(406).json({
            status: 406,
            data: "Email inválido // La contraseña debe contener mínimo 8 caracteres, incluyendo una letra y un número"
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
                                    data: "No estás autorizado. Redireccionando a login",
                                    ok: false,
                                    status: 401,
                                    url: '/login'
                                })
                            }
                        })
                } catch {
                    res.status(500).json({
                        data: "Hay un problema en nuestro servidor. Inténtalo más tarde",
                        ok: false,
                        status: 500
                    })
                }
            })
        }                 
    } catch {
        res.status(401).json({
            data: "No estás autorizado. Redireccionando a login",
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
                                    data: "Imposible salir",
                                    ok: false
                                })
                                db.close()
                            } else {
                                res.status(200).json({
                                    status: 200,
                                    data: "Saliendo del área administrador",
                                    ok: true,
                                    url: '/login'
                                })
                                db.close()
                            }
                        })
                } catch {
                    res.status(500).json({
                        status: 500,
                        data: "Hay un problema en nuestro servidor. Inténtalo más tarde",
                        ok: false,
                    })
                }
            })
        }             
    } catch {
        res.status(401).json({
            status: 401,
            data: "Imposible salir. Ya estás fuera",
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
                            data: "Error en la base de datos",
                        })
                        db.close()
                    } else {
                        res.status(200).json({
                            status: 200,
                            data: "Pregunta añadida correctamente",
                            url: "/admin"
                        })
                        db.close()
                    }
                })
        } catch {
            res.status(500).json({
                status: 500,
                data: "Hay un problema en nuestro servidor. Inténtalo más tarde"
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
                            data: "Pregunta borrada correctamente",
                            ok: true,
                            url: '/admin'
                        })
                        db.close()
                    })
        })
    } catch {
        res.status(500).json({
            status: 500,
            data: "Hay un problema en nuestro servidor. Inténtalo más tarde",
            ok: false,
            })
    }
})

// -------------------------------------------------EDIT

server.put('/edit', (req, res) => {
    MongoClient.connect(MONGOdb, optionsMongo, (err, db) => {
        try {
            db.db("quiz")
                .collection("questions")
                .updateOne({qu: req.body.qu}, { $set: {an: req.body.an, ok: req.body.ok}}, (err, result) => {
                    if (err){
                        res.status(400).json({
                            status: 400,
                            data: "Error en la base de datos",
                        })
                        db.close()
                    } else {
                        res.status(200).json({
                            status: 200,
                            data: "Pregunta editada correctamente",
                            url: "/admin"
                        })
                        db.close()
                    }
                })
        } catch {
            res.status(500).json({
                status: 500,
                data: "Hay un problema en nuestro servidor. Inténtalo más tarde"
            })
        }
    })
})

// -------------------------------------------------GET QUESTIONS

server.get('/getQuestions', (req, res) => {
    try {
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
    } catch {
        res.status(500).json({
            data: "Hay un problema en nuestro servidor. Inténtalo más tarde",
            ok: false,
            status: 500
        })
    }
})