const express = require('express');
const morgan = require('morgan');
const exphbs = require('express-handlebars');
const session = require('express-session');
const path = require('path');
const favicon = require('serve-favicon');
const passport = require('passport');
const flash = require('connect-flash');
const bodyParser = require('body-parser');

const { database } = require('./keys');
// initializations
const app = express();
require('./lib/passport');

// settings
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.engine('.hbs', exphbs({
    defaultLayout: 'main',
    helpers: require(path.join(__dirname, 'lib', 'helpers')),
    layoutsDir: path.join(app.get('views'), 'layouts'),
    partialsDir: path.join(app.get('views'), 'partials'),
    extname: '.hbs'
}));
app.set('view engine', '.hbs');
app.use(favicon(path.join(__dirname, 'public', 'imgs', 'favicon.ico')));

// Middlewares
//app.use(morgan('dev'));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(session({
    secret: 'faztmysqlnodemysql',
    resave: false,
    saveUninitialized: false
}));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

// Global Variables
app.use((req, res, next) => {
    app.locals.success = req.flash('success');
    app.locals.message = req.flash('message');
    app.locals.user = req.user;
    next();
});

// Routes
app.use(require('./routes/index'));
app.use(require('./routes/authentication'));
app.use(require('./routes/upload'));
app.use('/dashboard', require('./routes/dashboard'));

// Public
app.use(express.static(path.join(__dirname, 'public')));

// Starting the server
app.listen(app.get('port'), () => {

    console.log('Server on port,', app.get('port'));

});