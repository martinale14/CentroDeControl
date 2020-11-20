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
        let bienvenida;
        const user = rows[0];
        console.log(user.NOMBRECOMPLE + ' ha ingresado');
        req.session.user = user;
        switch(user.SEXUALIDAD){

            case 'm':
                bienvenida = 'Bienvenido'
            break;
            case 'f':
                bienvenida = 'Bienvenida'
            break;
            default:
                bienvenida = 'Bienvenid@'
            break;

        }

        if(contraseña == user.CONTRASENA){

            const nombre = user.NOMBRECOMPLE.split(" ");
            done(null, user, req.flash('success', `${bienvenida} ${nombre[0]}`));

        }else{

            done(null, false, req.flash('message', 'Contraseña Incorrecta'));

        }
    }else {

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

