const express = require('express');
const app = express();
const router = express.Router();

const pool = require('../database');
const { isLoggedIn } = require('../lib/auth');

//colocar (isLoggedIn)

router.get('/',  async (req, res) => {

    var modulos = new Array();
    var parMio = new Array();
    var zonas = new Array();
    var mediciones = new Array();
    modulos = await pool.query('SELECT * FROM ELEMENTOS_MEDICION');
    for(let i = 0; i < modulos.length; i++){
        parMio[i] = await pool.query('SELECT * FROM PARADAS_MIO WHERE ID_PARADA_MIO = ?', modulos[i].PARADAS_MIO_ID_PARADA_MIO);
        zonas[i] = await pool.query('SELECT * FROM ZONAS WHERE ID_ZONA = ?', parMio[0][0].ZONAS_ID_ZONA);
        mediciones[i] = await pool.query('SELECT * FROM MEDICIONES WHERE ELEMENTOS_MEDICION_ID = ? order by FECHA_HORAD DESC', modulos[i].ID);
    }
    res.render('dashboard.hbs', {modulos, mediciones});

});

module.exports = router;