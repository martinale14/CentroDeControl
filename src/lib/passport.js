const passport = require('passport');
const Strategy = require('passport-local').Strategy;

const pool = require('../database');

passport.use('local.login', new Strategy({
    
    usernameField: 'cedula',
    passwordField: 'contraseña',
    passReqToCallback: true

}, async (req, cedula, contraseña, done) => {

    const rows = await pool.query('SELECT * FROM USUARIOS WHERE CEDULA = ?', [cedula]);
    if(rows.length > 0){
        const user = rows[0];
        console.log(rows[0]);
        if(contraseña == user.CONTRASENA){

            const nombre = user.NOMBRECOMPLE.split(" ");
            done(null, user, req.flash('success', 'Bienvenid@ ' + nombre[0]));
            console.log("iniciado");

        }else{
            done(null, false, req.flash('message', 'Contraseña Incorrecta'));
            console.log("no contraseña");
        }
    }else {
        console.log("user x");
        return done(null, false, req.flash('message', 'El usuario no existe'));
    }

}));

passport.serializeUser((user, done) => {
    done(null, user.ID_USUARIO);
  });
  
  passport.deserializeUser(async (id, done) => {
    const rows = await pool.query('SELECT * FROM USUARIOS WHERE ID_USUARIO = ?', [id]);
    done(null, rows[0]);
  });