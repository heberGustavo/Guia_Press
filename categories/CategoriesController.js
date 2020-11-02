const express = require('express');
const router = express.Router();
const slugify = require('slugify');

const Category = require('./Category');

/*Foi criado um Middleware para que somente os usuarios logados possam ter acesso a determinadas paginas do sistema */
const adminAuth = require('../middleware/adminAuth');

//Get All
router.get('/admin/categories', adminAuth, (req, res) => {

    Category.findAll().then(categories => {
        res.render('admin/categories/index', { categories: categories });
    });

});

router.get('/admin/categories/new', adminAuth, (req, res) => {
    res.render('admin/categories/new');
});

//Save
router.post('/categories/save', adminAuth, (req, res) => {
    var title = req.body.title;

    if (title != undefined) {

        Category.create({
            title: title,
            slug: slugify(title)
        }).then(() => {
            res.redirect('/admin/categories');
        });

    } else {
        res.redirect('/admin/categories/new')
    }
});

//Delete
router.post('/categories/delete', adminAuth, (req, res) => {
    var id = req.body.id;

    if (id != undefined) { // Se nao for indefinido
        if (!isNaN(id)) { // Se for numero

            Category.destroy({
                where: {
                    id: id
                }
            }).then(() => {
                res.redirect('/admin/categories');
            });
        } else {
            res.redirect('/admin/categories');
        }
    } else {
        res.redirect('/admin/categories');
    }

});

router.get('/admin/categories/edit/:id', adminAuth, (req, res) => {
    var id = req.params.id;

    //Se não for numero
    if (isNaN(id)) {
        res.redirect('/admin/categories');
    }

    Category.findByPk(id)
        .then(category => {

            if (category != undefined) {
                res.render('admin/categories/edit', { category: category });
            }
            else {
                res.redirect('/admin/categories');
            }

        })
        .catch(error => {
            res.redirect('/admin/categories');
        });
})

router.post('/categories/update', adminAuth, (req, res) => {
    var id = req.body.id;
    var title = req.body.title;

    Category.update({ title: title, slug: slugify(title) }, {
        where: {
            id: id
        }
    }).then(() => {
        res.redirect('/admin/categories');
    });

});

module.exports = router;