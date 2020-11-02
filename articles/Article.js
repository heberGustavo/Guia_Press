const Sequelize = require('sequelize');
const connection = require('../database/database');
const Category = require('../categories/Category');

const Article = connection.define('articles', {
    title: {
        type: Sequelize.STRING,
        allowNull: false
    },
    slug: {
        type: Sequelize.STRING,
        allowNull: false
    },
    body: {
        type: Sequelize.TEXT,
        allowNull: false
    }
    //É gerado o 'categoryId', por causa do relacionamento abaixo
});

/**Relacionamentos
 * Para criar relacionamentos entre classe, você deve escolher uma classe (Article ou Category) 
   para relacionar os dados, não tem importancia qual que ela seja.
*/

Category.hasMany(Article); // 1 Category para MUITOS Articles
Article.belongsTo(Category); // 1 Article para 1 Categoria

/*Executar somente 1x, na criacao da tabela */
// Article.sync({force: true});

module.exports = Article;