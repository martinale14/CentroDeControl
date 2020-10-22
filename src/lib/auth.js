module.exports = {
    isLoggedIn (req, res, next) {
        if (req.isAuthenticated()) {
            return next();
        }
        return res.redirect('/');
    },
    isLoggedOut (req, res, next) {

        if (req.isAuthenticated()) {
            return res.redirect('/dashboard');
        }
        return next();

    }
};