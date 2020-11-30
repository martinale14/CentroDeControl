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

    let options = {
        timeZone: 'America/New_York',
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
        hour12: false,
      },
      formatter = new Intl.DateTimeFormat([], options);

    let fecha = (formatter.format(date)).toString();

    console.log(fecha);  
    
    console.log(date);

    let fDate = fecha.replace(',', '').replace(' PM', '').replace(' AM', '').replace('/', '-').replace('/', '-');

    fDate = fDate.split(' ');

    eca = fDate[0].split('-');

    fDate = `${eca[2]}-${eca[0]}-${eca[1]} ${fDate[1]}`;

    return fDate;

}


module.exports = router;