const express = require('express');
const app = express();
const router = express.Router();

const pool = require('../database');
const { isLoggedIn } = require('../lib/auth');

router.get('/', isLoggedIn, async (req, res) => {

    const modulos = await pool.query('SELECT * FROM ELEMENTOS_MEDICION');
    res.render('dashboard.hbs', {modulos});

});

module.exports = router;