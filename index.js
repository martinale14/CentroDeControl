//Inicialización
const express = require('express');
const favicon = require('serve-favicon');
const mysql = require('mysql');
const path = require('path');
const app = express();
const port = 3000;

//Middlewares
app.use(favicon(path.join(__dirname, 'resources', 'imgs', 'favicon.ico')));
app.use(express.static(__dirname + '/resources'));

//Settings
app.set('view engine','ejs');

const conection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'chechonito14',
    database: 'ejemplo'
});

//Rutas
app.get('/', (req, res) => {

    res.render('index.ejs');

});

//Iniciar
app.listen(port, () => {

    console.log(`Server on port ${port}`);

});