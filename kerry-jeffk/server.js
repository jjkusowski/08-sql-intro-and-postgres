'use strict';

// DONE: Install and require the NPM Postgres package 'pg' into your server.js, and ensure that it is then listed as a dependency in your package.json
const pg = require('pg');
const fs = require('fs');
const express = require('express');

// REVIEWED: Require in body-parser for post requests in our server. If you want to know more about what this does, read the docs!
const bodyParser = require('body-parser');
const PORT = process.env.PORT || 3000;
const app = express();

// DONE: Complete the connection string (conString) for the URL that will connect to your local Postgres database.

// Mac:
const conString = 'postgres://localhost:5432';


// DONE: Our pg module has a Client constructor that accepts one argument: the conString we just defined.
// This is how it knows the URL and, for Windows and Linux users, our username and password for our database when client.connect() is called below. Thus, we need to pass our conString into our pg.Client() call.

const client = new pg.Client(conString);

// REVIEWED: Use the client object to connect to our DB.
client.connect();


// REVIEWED: Install the middleware plugins so that our app can use the body-parser module.
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static('./public'));


// REVIEWED: Routes for requesting HTML resources
app.get('/new', (request, response) => {
  // COMMENTED: What number(s) of the full-stack-diagram.png image correspond to the following line of code? Which method of article[View??].js is interacting with this particular piece of `server.js`? What part of CRUD is being enacted/managed by this particular piece of code?

  // The response below is #5 which is utilizing the .initNewArticlePage method on articleView.js.  This is a response from server to client which is a READ CRUD operation.

  response.sendFile('new.html', {root: './public'});
});


// REVIEWED: Routes for making API calls to use CRUD Operations on our database
app.get('/articles', (request, response) => {
  // COMMENTED: What number(s) of the full-stack-diagram.png image correspond to the following line of code? Which method of article.js is interacting with this particular piece of `server.js`? What part of CRUD is being enacted/managed by this particular piece of code?

  // This query corresponds to #s 3, 4, and 5 which first utilizes the 'Article.fetchAll to query from the DB which contains our array of articles. This response is, just as the above response, also a READ CRUD operation.  The result of this query is #4, which presents to server.js all rows of the articles DB, else presents an error.  Lastly, it sends the result.rows as a response to the user client (#5) as an argument in the Article.loadAll method which is itself instantiated in the Article.fetchAll method.

  client.query('SELECT * FROM articles')
    .then(function(result) {
      response.send(result.rows);
    })
    .catch(function(err) {
      console.error(err)
    })
});

app.post('/articles', (request, response) => {
  // COMMENTED: What number(s) of the full-stack-diagram.png image correspond to the following line of code? Which method of article.js is interacting with this particular piece of `server.js`? What part of CRUD is being enacted/managed by this particular piece of code?

  // This query corresponds to #s 3, 4, and 5 which first utilizes the 'Article.insertRecord to send to the DB a SQL INSERT operation which will add a new article. This response is a CREATE CRUD operation.  The result of this query is #4, which sends a success result, else presents an error.  Lastly, it sends a string of "insert complete" as a response to the user client (#5).

  client.query(
    `INSERT INTO
    articles(title, author, "authorUrl", category, "publishedOn", body)
    VALUES ($1, $2, $3, $4, $5, $6);
    `,
    [
      request.body.title,
      request.body.author,
      request.body.authorUrl,
      request.body.category,
      request.body.publishedOn,
      request.body.body
    ]
  )
    .then(function() {
      response.send('insert complete')
    })
    .catch(function(err) {
      console.error(err);
    });
});

app.put('/articles/:id', (request, response) => {
  // COMMENTED: What number(s) of the full-stack-diagram.png image correspond to the following line of code? Which method of article.js is interacting with this particular piece of `server.js`? What part of CRUD is being enacted/managed by this particular piece of code?

  // This query corresponds to #s 3, 4, and 5 which first utilizes the Article.updateRecord to send to the DB a SQL UPDATE operation which will update an existing article by specifying an id. This response is an UPDATE CRUD operation.  The result of this query is #4, which sends a success result, else presents an error.  Lastly, it sends a string of "update complete" as a response to the user client (#5).

  client.query(
    `UPDATE articles
    SET
      title=$1, author=$2, "authorUrl"=$3, category=$4, "publishedOn"=$5, body=$6
    WHERE article_id=$7;
    `,
    [
      request.body.title,
      request.body.author,
      request.body.authorUrl,
      request.body.category,
      request.body.publishedOn,
      request.body.body,
      request.params.id
    ]
  )
    .then(() => {
      response.send('update complete')
    })
    .catch(err => {
      console.error(err);
    });
});

app.delete('/articles/:id', (request, response) => {
  // COMMENTED: What number(s) of the full-stack-diagram.png image correspond to the following line of code? Which method of article.js is interacting with this particular piece of `server.js`? What part of CRUD is being enacted/managed by this particular piece of code?

  // This query corresponds to #s 3, 4, and 5 which first utilizes the Article.deleteRecord to send to the DB a SQL DELETE operation which will delete an existing article by specifying an id. This response is an DELETE CRUD operation.  The result of this query is #4, which sends a success result, else presents an error.  Lastly, it sends a string of "Delete complete" as a response to the user client (#5).

  client.query(
    `DELETE FROM articles WHERE article_id=$1;`,
    [request.params.id]
  )
    .then(() => {
      response.send('Delete complete')
    })
    .catch(err => {
      console.error(err);
    });
});

app.delete('/articles', (request, response) => {
  // COMMENTED: What number(s) of the full-stack-diagram.png image correspond to the following line of code? Which method of article.js is interacting with this particular piece of `server.js`? What part of CRUD is being enacted/managed by this particular piece of code?

  // This query corresponds to #s 3, 4, and 5 which first utilizes the Article.truncateTable to send to the DB a SQL DELETE operation which will delete all articles, but not the table itself. This response is an DELETE CRUD operation.  The result of this query is #4, which sends a success result, else presents an error.  Lastly, it sends a string of "Delete all articles complete" as a response to the user client (#5).

  client.query(
    'DELETE FROM articles;'
  )
    .then(() => {
      response.send('Delete all articles complete')
    })
    .catch(err => {
      console.error(err);
    });
});

// COMMENTED: What is this function invocation doing?

// It will create a database from scratch then load articles from hackerIpsum.json, else it will do nothing.  If database exists and is empty, it will load articles from hackerIpsum.json.

loadDB();

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}!`);
});


//////// ** DATABASE LOADER ** ////////
////////////////////////////////////////
function loadArticles() {
  //COMMENTED: What number(s) of the full-stack-diagram.png image correspond to the following line of code? Which method of article.js is interacting with this particular piece of `server.js`? What part of CRUD is being enacted/managed by this particular piece of code?

  // This query corresponds to #s 3 and 4 which checks to see articles database is populated, assuming that it already exists. This response is an CREATE CRUD operation.  The result of this query is #4, which sends a success result, else presents an error.

  client.query('SELECT COUNT(*) FROM articles')
    .then(result => {
    // REVIEW: result.rows is an array of objects that Postgres returns as a response to a query.
    // If there is nothing on the table, then result.rows[0] will be undefined, which will make count undefined. parseInt(undefined) returns NaN. !NaN evaluates to true.
    // Therefore, if there is nothing on the table, line 158 will evaluate to true and enter into the code block.
      if(!parseInt(result.rows[0].count)) {
        fs.readFile('./public/data/hackerIpsum.json', (err, fd) => {
          JSON.parse(fd.toString()).forEach(ele => {
            client.query(`
              INSERT INTO
              articles(title, author, "authorUrl", category, "publishedOn", body)
              VALUES ($1, $2, $3, $4, $5, $6);
            `,
              [ele.title, ele.author, ele.authorUrl, ele.category, ele.publishedOn, ele.body]
            )
          })
        })
      }
    })
}

function loadDB() {
  // COMMENTED: What number(s) of the full-stack-diagram.png image correspond to the following line of code? Which method of article.js is interacting with this particular piece of `server.js`? What part of CRUD is being enacted/managed by this particular piece of code?

  // This query corresponds to #s 3 and 4 which checks to see articles database structure exists. If no table exists, it will create a table using the field names with the specified data types, and also a required primary key.  Then it will call the loadArticles method described above. This response is an CREATE CRUD operation.  The result of this query is #4, which sends a success result, else presents an error.

  //

  client.query(`
    CREATE TABLE IF NOT EXISTS articles (
      article_id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      author VARCHAR(255) NOT NULL,
      "authorUrl" VARCHAR (255),
      category VARCHAR(20),
      "publishedOn" DATE,
      body TEXT NOT NULL);`
  )
    .then(() => {
      loadArticles();
    })
    .catch(err => {
      console.error(err);
    });
}
