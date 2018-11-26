const express = require('express');
const session = require("express-session");
const mustacheExpress = require('mustache-express');
const bodyParser = require('body-parser');
const entrieList = require('./entrie-list');
const entrieEdit = require('./entrie-edit');
const entrieAdd = require('./entrie-add');
const pdfgen = require('./pdfgen');
const moment = require('moment');
const {
  Client
} = require('pg');

const ldapauth = require('./ldapauth');

require('dotenv').config();
//console.log(process.env);




const app = express();


//LDAP Tetsts
//console.log("LDAP: ", ldapauth.authenticate("ulewu","1averhak"));
ldapauth.authenticate("ulewu","PASSWORT",function(ret) {
    console.log("LDAP Result: ", ret);
});


// Session management


// Use the session middleware
app.use(session({
  secret: 'keyboard cat'
})
);
  // Authentication and Authorization Middleware
  var auth = function(req, res, next) {
    if (req.session && req.session.user === "amy" && req.session.admin)
      return next();
    else
      return res.sendStatus(401);
  };

  // Login endpoint
  app.get('/login', function (req, res) {
/*    if (!req.query.username || !req.query.password) {
      res.send('login failed');
    } else if(req.query.username === "amy" || req.query.password === "amyspassword") {
      req.session.user = "amy";
      req.session.admin = true;
      res.send("login success!");
    }
*/

    let m = moment().format('YYYY-MM-DD hh:mm:ss');
    let sessionTime = moment().add(1, 'minutes').format('YYYY-MM-DD hh:mm:ss');
    console.log('Current Time at: ', m)
    console.log('calculated session Time at: ', sessionTime)
    req.session.user = "testuser";
    req.session.admin = true;
    req.session._expires = sessionTime;
    //console.log("Session info from login-route: ", req.session);
    res.redirect("/entries");

  });

  // Logout endpoint
app.get('/logout', function (req, res) {
  req.session.destroy();
  res.send("logout success!");
});
//////////////////////////////

app.use(express.static('public'));

app.use(bodyParser.urlencoded({
  extended: false
}));

app.listen(process.env.PORT, () => {
  console.log('Listening on port http://localhost:' + process.env.PORT);

  //testmodule.hallo()
  //testmodule.bla()
});


const mustache = mustacheExpress();
mustache.cache = null;
app.engine('mustache', mustache);

app.set('view engine', 'mustache');

app.use('/css', express.static(__dirname + '/node_modules/bootstrap/dist/css' ));

// -> Objekt initialisieren und an ausgelagerte Funktion übergeben
// Benötigt : const entrieList = require('./entrie-list');

// Anzeige aller Einträge
app.get('/entries/', entrieList.pageView);
//Mit Suche
app.post('/entries/', entrieList.pageView);

app.get('/pdf/', pdfgen);

app.get('/entries/edit/:id', entrieEdit.appget);
app.post('/entrie/edit/:id', entrieEdit.apppost)

app.get('/entrie/add', entrieAdd.appget);
app.post('/entrie/add', entrieAdd.apppost) ;


app.post('/entrie/delete/:id', (req, res) => {
  console.log('deleting entrie_id : ', req.params.id);
  const client = new Client();
  client.connect()
    .then(() => {
      const sql = 'delete from entries where entrie_id = $1;'
      const params = [req.params.id];
      return client.query(sql, params);
    })
    .then((result) => {
      console.log('SQL delete result: %s ', result.rowCount);
    })
    .catch((err) => {
      console.log('SQL Error: %s ', err);
    })
  res.redirect('/entries');
});
