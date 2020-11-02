const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs')
const User = require('./User')

router.get('/admin/users', (req, res) => {
    
    User.findAll().then(users => {
        res.render('admin/users/index', { users: users });
    });
})

router.get('/admin/user/create', (req, res) => {
    res.render('admin/users/create')
});

router.post('/user/create', (req, res) => {
    var email = req.body.email;
    var password = req.body.password;

    User.findOne({
        where: {
            email: email
        }
    }).then((user) => {
        if (user == undefined) {
            //Converter senha para HASH
            var salt = bcrypt.genSaltSync(10);
            var hash = bcrypt.hashSync(password, salt);

            User.create({
                email: email,
                password: hash
            }).then(() => {
                res.redirect('/login');
            }).catch(err => {
                res.json(err);
            })
        } else{
            res.send('Email já cadastrado');
        }
    });

});

router.post('/user/delete', (req, res) => {
    var id = req.body.id;

    if(!isNaN(id)){

        User.findByPk(id).then(user => {
            if(user != undefined){

                User.destroy({
                    where: {
                        id: id
                    }
                }).then(() => {
                    res.redirect('/admin/users');
                })

            } else{
                res.redirect('/admin/users');
            }
        });

    } else{
        res.redirect('/admin/users');
    }
})

router.get('/admin/user/edit/:id', (req, res) => {
    var id = req.params.id;

    if(!isNaN(id)){
        User.findByPk(id).then(user => {
            if(user != undefined){
                res.render('admin/users/edit', {user: user});
            } else {
                res.redirect('/admin/users');
            }
        });
    } else {
        res.redirect('/admin/users');
    }
});

router.get('/login', (req, res) => {
    res.render('admin/users/login');
});

router.post('/authenticate', (req, res) => {
    var email = req.body.email;
    var password = req.body.password;

    if(email != undefined && password != undefined){
        User.findOne({ where: { email: email } }).then(user => {
            if(user != undefined){

                var correct = bcrypt.compareSync(password, user.password);

                if(correct){

                    //Se senha correta, cria a session e logar
                    req.session.user = {
                        id: user.id,
                        email: user.email
                    }

                    res.redirect('/admin/articles')

                } else{
                    res.redirect('/login');    
                }

            } else {
                res.redirect('/login');
            }
        });
    } else {
        res.redirect('/login');
    }

});

router.get('/logout', (req, res) => {
    req.session.user = undefined;
    res.redirect('/');
});

module.exports = router;