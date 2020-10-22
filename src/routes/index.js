const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.render('login.hbs');
});


router.get('/dashboard', (req, res) => {
    res.render('dashboard.hbs');
});

module.exports = router;