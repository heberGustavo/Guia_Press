function adminAuth(req, res, next){
    if(req.session.user != undefined){
        next(); //Se estive logado
    } else {
        res.redirect('/login');
    }
}

module.exports = adminAuth;