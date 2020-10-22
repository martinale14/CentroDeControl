const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.render('login.hbs');
});


router.get('/Dashboard', (req, res) => {
    res.send('Perfil iniciado');
});

module.exports = router;