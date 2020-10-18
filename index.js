//Inicialización
const express = require('express');
const favicon = require('serve-favicon');
const path = require('path');
const app = express();
const port = 3000;

//Middlewares
app.use(favicon(path.join(__dirname, 'resources', 'imgs', 'favicon.ico')));
app.use(express.static(__dirname + '/resources'));

//Settings
app.set('view engine','ejs');

//Rutas
app.get('/', (req, res) => {

    res.render('index.ejs');

});

//Iniciar
app.listen(port, () => {

    console.log(`Server on port ${port}`);

});