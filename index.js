const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const session = require('express-session');
const connection = require('./database/database');

/* Models */
const Article = require('./articles/Article');
const Category = require('./categories/Category');
const User = require('./users/User');

/* Controllers */
const categoriesController = require('./categories/CategoriesController');
const articlesController = require('./articles/ArticlesController');
const usersController = require('./users/UsersController');

//View Engine
app.set('view engine', 'ejs');

//Sessões - Esse tipo de configuração não é recomendada para projeto de Medio e Grande Porte, pois como ser um grande fluxo de requisição o servidor pode não aguentar. Recomendado usar o REDIS
app.use(session({
    secret: 'umaSenhaCriptografadaDePreferencia', cookie: {maxAge: 3000000}
}))

//Arquivos estaticos(CSS, JS, Imagens)
app.use(express.static(__dirname + '/public'));

//Body-Parser
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

//Database
connection
    .authenticate()
    .then(() => {
        console.log('Conexão feita com sucesso!');
    })
    .catch((error) => {
        console.log(error);
    });

//Para ter acesso ao controller
//*** Tem que ser um dos ultimos a ser chamado
app.use('/', categoriesController);
app.use('/', articlesController);
app.use('/', usersController);


/*Rotas*/
app.get('/', (req, res) => {
    Article.findAll({
        order: [
            ['id', 'DESC']
        ],
        limit: 4
    }).then(articles => {
        Category.findAll().then(categories => {
            res.render('index', { articles: articles, categories: categories } );
        });
    });
})

app.get('/:slug', (req, res) => {
    var slug = req.params.slug;

    Article.findOne({
        where: {
            slug: slug
        }
    }).then(article => {
        if(article != undefined){

            Category.findAll().then(categories => {
                res.render('article', { article: article, categories: categories } );
            });
            
        } else{
            res.redirect('/')
        }
    }).catch(err => {
        res.redirect('/');
    })
});

app.get('/category/:slug', (req, res) => {
    var slug = req.params.slug;

    Category.findOne({
        where: {
            slug: slug
        },
        include: [ { model: Article }]
    }).then(category => {

        if(category != undefined){

            Category.findAll().then(categories => {
                res.render('index', { categories: categories, articles: category.articles });
            });

        } else {
            res.redirect('/');
        }

    }).catch(err => {
        res.redirect('/');
    });
});

app.listen(8080, () => {
    console.log('O servidor está rodando ...');
})