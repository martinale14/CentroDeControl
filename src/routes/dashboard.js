const express = require('express');
const app = express();
const router = express.Router();

const pool = require('../database');
const { isLoggedIn } = require('../lib/auth');

//colocar (isLoggedIn)

var data = new Array();
var modulos = new Array();
var meds = new Array();

var parMio = new Array();
var zonas = new Array();
var mediciones = new Array();

router.get('/novedades', isLoggedIn, async (req, res) => {

    modulos = await pool.query('SELECT * FROM ELEMENTOS_MEDICION');
    for(let i = 0; i < modulos.length; i++){
        parMio[i] = await pool.query('SELECT * FROM PARADAS_MIO WHERE ID_PARADA_MIO = ?', modulos[i].PARADAS_MIO_ID_PARADA_MIO);
        zonas[i] = await pool.query('SELECT * FROM ZONAS WHERE ID_ZONA = ?', parMio[0][0].ZONAS_ID_ZONA);
        mediciones[i] = await pool.query('SELECT * FROM MEDICIONES WHERE ELEMENTOS_MEDICION_ID = ? order by FECHA_HORAD DESC', modulos[i].ID);
    }
    res.render('inicio', {layout: 'dashboard',modulos, mediciones, parMio, zonas});

});

router.get('/',  isLoggedIn,async (req, res) => {

    meds = await pool.query('SELECT * FROM MEDICIONES ORDER BY FECHA_HORAD DESC');

    for (let i = 0; i < meds.length; i++) {
        
        meds[i].info= await pool.query(`SELECT * FROM ELEMENTOS_MEDICION WHERE ID = ${meds[i].ELEMENTOS_MEDICION_ID}`);
        
    }

    res.render('busqueda.hbs', {layout: 'dashboard', data, meds});

});

router.get('/mapa',  isLoggedIn, (req, res) => {

    
    getData();
    res.render('mapa.hbs', {layout: 'dashboard',modulos, mediciones, parMio, zonas, meds});

});

router.post('/', isLoggedIn,async (req, res) => {

    const variables = req.body;

    const filtros = {

        'ubicacion' : `${variables.latitud}%,%${variables.longitud}`,
        'fechaIn': `${variables.fechaIn} ${variables.HoraInicio}`,
        'fechaFn': `${variables.fechaFn} ${variables.HoraFin}`

    }

    let querySearch;

    if(filtros.fechaIn == ' '){


        querySearch = `SELECT * FROM MEDICIONES AS me WHERE (me.FECHA_HORAD < '${filtros.fechaFn}' AND me.ELEMENTOS_MEDICION_ID IN (SELECT ID FROM ELEMENTOS_MEDICION WHERE UBICACION LIKE '%${filtros.ubicacion}%') ) order by me.FECHA_HORAD DESC`;

    }
    if(filtros.fechaFn == ' '){

        querySearch = `SELECT * FROM MEDICIONES AS me WHERE (me.FECHA_HORAD > '${filtros.fechaIn}' AND me.ELEMENTOS_MEDICION_ID IN (SELECT ID FROM ELEMENTOS_MEDICION WHERE UBICACION LIKE '%${filtros.ubicacion}%') ) order by me.FECHA_HORAD DESC`;

    }
    if(filtros.fechaIn == ' ' && filtros.fechaFn == ' '){

        querySearch = `SELECT * FROM MEDICIONES AS me WHERE me.ELEMENTOS_MEDICION_ID IN (SELECT ID FROM ELEMENTOS_MEDICION WHERE UBICACION LIKE '%${filtros.ubicacion}%')  order by me.FECHA_HORAD DESC`;


    }
    if(filtros.fechaIn != ' ' && filtros.fechaFn != ' '){

        querySearch = `SELECT * FROM MEDICIONES AS me WHERE ((me.FECHA_HORAD < '${filtros.fechaFn}' AND me.FECHA_HORAD > '${filtros.fechaIn}') AND me.ELEMENTOS_MEDICION_ID IN (SELECT ID FROM ELEMENTOS_MEDICION WHERE UBICACION LIKE '%${filtros.ubicacion}%') ) order by me.FECHA_HORAD DESC`;


    }




    meds = await pool.query(querySearch);

    for (let i = 0; i < meds.length; i++) {
        
        meds[i].info= await pool.query(`SELECT * FROM ELEMENTOS_MEDICION WHERE ID = ${meds[i].ELEMENTOS_MEDICION_ID}`);
        
    }

    res.render('busqueda.hbs', {layout: 'dashboard', data, meds});
});

async function getData(){

    modulos = await pool.query('SELECT * FROM ELEMENTOS_MEDICION');
    for(let i = 0; i < modulos.length; i++){
        parMio[i] = await pool.query('SELECT * FROM PARADAS_MIO WHERE ID_PARADA_MIO = ?', modulos[i].PARADAS_MIO_ID_PARADA_MIO);
        zonas[i] = await pool.query('SELECT * FROM ZONAS WHERE ID_ZONA = ?', parMio[0][0].ZONAS_ID_ZONA);
        mediciones[i] = await pool.query('SELECT * FROM MEDICIONES WHERE ELEMENTOS_MEDICION_ID = ? order by FECHA_HORAD DESC', modulos[i].ID);
    }

}

module.exports = router;