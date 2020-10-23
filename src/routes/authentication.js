const express = require('express');
const router = express.Router();
const {body, validationResult} = require('express-validator');

const passport = require('passport');
const { isLoggedIn } = require('../lib/auth');

const pool = require('../database');
const { route } = require('.');

router.post('/', (req, res, next) => {
    body('cedula', 'No es un formato admitido').notEmpty().isNumeric();
    body('contraseña', 'Contraseña requerida').notEmpty();
    const errors = validationResult(req);
    if (errors.length > 0) {
        req.flash('message', errors[0].msg);
        res.redirect('/');
    }
    passport.authenticate('local.login', {
        successRedirect: '/dashboard',
        failureRedirect: '/',
        failureFlash: true
    })(req, res, next);
});

router.get('/dashboard', isLoggedIn, (req, res, next) => {

    next();

});

router.get('/logout', (req, res) => {

    req.logOut();
    res.redirect('/');

});

module.exports = router;