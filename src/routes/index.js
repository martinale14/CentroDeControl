const express = require('express');
const router = express.Router();

const { isLoggedIn } = require('../lib/auth');

router.get('/', async (req, res) => {
    
    res.render('login.hbs');
    
});

module.exports = router;