//Inicialización
const express = require('express');
const app = express();
const port = 3000;



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