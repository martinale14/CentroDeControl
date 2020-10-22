const express = require('express');
const router = express.Router();

const auth = require('../lib/auth');

router.get('/', auth.isLoggedOut, async (req, res) => {
    
    res.render('login.hbs');
    
});

module.exports = router;