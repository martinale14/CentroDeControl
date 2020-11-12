const express = require('express');
const router = express.Router();
const pool = require('../database');

getFecha();

router.post('/upload', async (req, res) => {

    let data = req.body;
    
    data.cAire = getCalidad(data);

    data.fecha = getFecha();

    await pool.query(`INSERT INTO MEDICIONES VALUES(0, ${data.ppm}, ${data.cAire}, '${data.fecha}', ${data.modulo})`);

    console.log(data);

} );

function getCalidad(data) {

    let cAire;

    if(data.ppm <= 200){

        cAire = 5;

    }else if (data.ppm > 200 && data.ppm <= 400){

        cAire = 4

    }else if (data.ppm > 40 && data.ppm <= 600){

        cAire = 3

    }else if (data.ppm > 600 && data.ppm <= 800){

        cAire = 2

    }else{

        cAire = 1

    }

    return cAire;

}

function getFecha(){

    let date = new Date();

    let fDate = `${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;

    console.log(fDate);

    return fDate;

}

module.exports = router;