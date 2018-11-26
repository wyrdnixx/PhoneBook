const express = require('express');
const mustacheExpress = require('mustache-express');
const bodyParser = require('body-parser');
const entrieList = require('./entrie-list');
const entrieEdit = require('./entrie-edit');
const entrieAdd = require('./entrie-add');
const pdfgen = require('./pdfgen');
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
