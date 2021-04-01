// -----------------------------------------PAQUETES

const express = require('express');
const ENV = require('dotenv').config();

// -------------------------------SERVIDOR Y PUERTOS

const server =  express()
const listenPort = process.env.STATIC || 4000;

const staticFilesPath = express.static(__dirname + '/Public');
server.use(staticFilesPath);

// -----------------------------PARSEADOR DE EXPRESS

server.use(express.urlencoded({extended:false}));
server.use(express.json());

// // ----------------------------------------MIDDLE

const cors = require('cors')
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
