//Inicialización
const express = require('express');
const favicon = require('serve-favicon');
const mysql = require('mysql');
const path = require('path');
const bodyParser = require('body-parser');
const app = express();
const port = 3000;

//Middlewares
app.use(favicon(path.join(__dirname, 'resources', 'imgs', 'favicon.ico')));
app.use(express.static(__dirname + '/resources'));
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json());
app.use(express.json());

//Settings
app.set('view engine','ejs');

//Rutas
app.get('/', (req, res) => {

    res.render('index.ejs');

});

app.post('/login', (req, res) => {

    res.send('Bienvenido, ' + req.body.email);

});

//Iniciar
app.listen(port, () => {

    console.log(`Server on port ${port}`);

});