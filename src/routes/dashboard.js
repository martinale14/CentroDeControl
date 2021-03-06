const express = require('express');
const {body, validationResult} = require('express-validator');
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

    meds = await pool.query('SELECT * FROM MEDICIONES ORDER BY FECHA_HORAD DESC');

    console.log(meds);
    
    res.render('inicio', {layout: 'dashboard',modulos, mediciones, parMio, zonas, meds});

});

router.get('/',  isLoggedIn,async (req, res) => {

    meds = await pool.query('SELECT * FROM MEDICIONES ORDER BY FECHA_HORAD ASC');

    for (let i = 0; i < meds.length; i++) {
        
        meds[i].info= await pool.query(`SELECT * FROM ELEMENTOS_MEDICION WHERE ID = ${meds[i].ELEMENTOS_MEDICION_ID}`);
        
    }

    modulos = await pool.query('SELECT * FROM ELEMENTOS_MEDICION');

    res.render('busqueda.hbs', {layout: 'dashboard', modulos, meds});

});

router.get('/mapa',  isLoggedIn, async (req, res) => {

    
    modulos = await pool.query('SELECT * FROM ELEMENTOS_MEDICION');
    for(let i = 0; i < modulos.length; i++){
        parMio[i] = await pool.query('SELECT * FROM PARADAS_MIO WHERE ID_PARADA_MIO = ?', modulos[i].PARADAS_MIO_ID_PARADA_MIO);
        zonas[i] = await pool.query('SELECT * FROM ZONAS WHERE ID_ZONA = ?', parMio[0][0].ZONAS_ID_ZONA);
        mediciones[i] = await pool.query('SELECT * FROM MEDICIONES WHERE ELEMENTOS_MEDICION_ID = ? order by FECHA_HORAD DESC', modulos[i].ID);
    }

    res.render('mapa.hbs', {layout: 'dashboard',modulos, mediciones, parMio, zonas, meds});

});

router.post('/', isLoggedIn,async (req, res) => {

    const variables = req.body;

    if(variables.fechaIn != '' && variables.HoraInicio == ''){

        variables.HoraInicio = '00:00';

    }else if (variables.fechaIn == '' && variables.HoraInicio != ''){

        variables.fechaIn = '2020-1-1'

    }

    if(variables.fechaFn != '' && variables.HoraFin == ''){

        variables.HoraFin = '23:59';

    }else if (variables.fechaFn == '' && variables.HoraFin != ''){

        variables.fechaIn = '3000-1-1'

    }

    const filtros = {

        'ubicacion' : `${variables.latitud}%,%${variables.longitud}`,
        'fechaIn': `${variables.fechaIn} ${variables.HoraInicio}`,
        'fechaFn': `${variables.fechaFn} ${variables.HoraFin}`

    }

    let querySearch;

    if(filtros.fechaIn == ' '){


        querySearch = `SELECT * FROM MEDICIONES AS me WHERE (me.FECHA_HORAD < '${filtros.fechaFn}' AND me.ELEMENTOS_MEDICION_ID IN (SELECT ID FROM ELEMENTOS_MEDICION WHERE UBICACION LIKE '%${filtros.ubicacion}%') ) order by me.FECHA_HORAD ASC`;

    }
    if(filtros.fechaFn == ' '){

        querySearch = `SELECT * FROM MEDICIONES AS me WHERE (me.FECHA_HORAD > '${filtros.fechaIn}' AND me.ELEMENTOS_MEDICION_ID IN (SELECT ID FROM ELEMENTOS_MEDICION WHERE UBICACION LIKE '%${filtros.ubicacion}%') ) order by me.FECHA_HORAD ASC`;

    }
    if(filtros.fechaIn == ' ' && filtros.fechaFn == ' '){

        querySearch = `SELECT * FROM MEDICIONES AS me WHERE me.ELEMENTOS_MEDICION_ID IN (SELECT ID FROM ELEMENTOS_MEDICION WHERE UBICACION LIKE '%${filtros.ubicacion}%')  order by me.FECHA_HORAD ASC`;


    }
    if(filtros.fechaIn != ' ' && filtros.fechaFn != ' '){

        querySearch = `SELECT * FROM MEDICIONES AS me WHERE ((me.FECHA_HORAD < '${filtros.fechaFn}' AND me.FECHA_HORAD > '${filtros.fechaIn}') AND me.ELEMENTOS_MEDICION_ID IN (SELECT ID FROM ELEMENTOS_MEDICION WHERE UBICACION LIKE '%${filtros.ubicacion}%') ) order by me.FECHA_HORAD ASC`;


    }

    modulos = [];

    meds = await pool.query(querySearch);

    for (let i = 0; i < meds.length; i++) {
        
        meds[i].info= await pool.query(`SELECT * FROM ELEMENTOS_MEDICION WHERE ID = ${meds[i].ELEMENTOS_MEDICION_ID}`);
        modulos.push(meds[i].info[0].ID);
        
    }

    modulos = modulos.filter((value, index, self) => {

        return self.indexOf(value) === index;

    });

    modulos.sort((a, b) => {

        return a - b;

    });

    for(let i = 0; i < modulos.length; i++){

        modulos[i] = {
            ID: modulos[i]
        }

    }

    console.log(modulos);

    res.render('busqueda.hbs', {layout: 'dashboard', modulos, meds});
});

module.exports = router;