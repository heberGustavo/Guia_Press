const express = require('express');
const router = express.Router();
const slugify = require('slugify');

const Category = require('../categories/Category');
const Article = require('./Article');

/*Foi criado um Middleware para que somente os usuarios logados possam ter acesso a determinadas paginas do sistema */
const adminAuth = require('../middleware/adminAuth');

router.get('/admin/articles', adminAuth, (req, res) => {
    Article.findAll({
        include: [{ model: Category }] //Para incluir os dados da Categoria
    }).then(articles => {
        res.render('admin/articles/index', { articles: articles });
    })
});

router.get('/article/:id', (req, res) => {
    var id = req.params.id;

    if(!isNaN(id)){
        Article.findByPk(id).then(article => {
            if(article != undefined){

                Category.findAll().then(categories => {
                    res.render('article', { article: article, categories: categories });
                });

            } else{
                res.redirect('/');
            }
        });
    } else{
        res.redirect('/');
    }
});

router.get('/admin/articles/new', adminAuth, (req, res) => {

    Category.findAll().then(categories => {
        res.render('admin/articles/new', { categories: categories });
    });

});

router.post('/article/save', adminAuth, (req, res) => {

    var title = req.body.title;
    var body = req.body.body;
    var categoryId = req.body.categoryId;

    Article.create({
        title: title,
        slug: slugify(title),
        body: body,
        categoryId: categoryId
    }).then(() => {
        res.redirect('/admin/articles')
    });

});

router.post('/article/delete', adminAuth, (req, res) => {
    var id = req.body.id;

    if (id != undefined) {
        if (!isNaN(id)) {
            Article.destroy({
                where: { id: id }
            }).then(() => {
                res.redirect('/admin/articles');
            })
        } else {
            res.redirect('/admin/articles');
        }
    } else {
        res.redirect('/admin/articles');
    }
});

router.get('/article/edit/:id', adminAuth, (req, res) => {
    var id = req.params.id;

    if (!isNaN(id)) {

        Article.findByPk(id)
            .then(article => {
                if (article != undefined) {

                    Category.findAll().then(categories => {
                        res.render('admin/articles/edit', { article: article, categories: categories });
                    });

                }
                else {
                    res.redirect('/admin/articles');
                }
            }).catch(err => {
                res.redirect('/admin/articles');
            });
    } else {
        res.redirect('/admin/articles');
    }
})

router.post('/article/update', adminAuth, (req, res) => {
    var title = req.body.title;
    var body = req.body.body;
    var categoryId = req.body.categoryId;
    var articleId = req.body.articleId;

    Article.update({ title: title, slug: slugify(title), body: body, categoryId: categoryId }, {
        where: {
            id: articleId
        }
    }).then(() => {
        res.redirect('/admin/articles');
    });
});

router.get('/articles/page/:num', (req, res) => {
    var page = req.params.num;
    var QUANT_ITENS = 4;
    var offset = 0;

    if(isNaN(page) || page == 1){
        offset = 0;
    } else{
        offset = (parseInt(page) -1) * QUANT_ITENS;
    }

    Article.findAndCountAll({
        limit: QUANT_ITENS,
        offset: offset,
        order: [
            ['id', 'DESC']
        ]
    }).then(articles => {

        /*
            Verifica se tem proxima pagina
            * Se a quantidade de itens é maior que a quantidade de postagens

            ex: 21 + 4 => 22 
        */
        var next;
        if(offset + QUANT_ITENS >= articles.count){
            next = false
        } else {
            next = true
        }

        var result = {
            page: parseInt(page),
            next: next,
            articles: articles
        }

        Category.findAll().then(categories => {
            res.render('admin/articles/page', { result: result, categories, categories});
        });

    })
})

module.exports = router;