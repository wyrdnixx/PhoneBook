const express = require('express');
const moment = require('moment');

 const {
   Client
 } = require('pg');

 const pageView = (req, res) => {
   const client = new Client();
   // console.log('Requested page: ' + Object.getOwnPropertyNames(req));
   console.log('Client: ' + req.connection.remoteAddress);
   console.log('Request: ' + req.url);

   //Session logging
   let m = moment().format('YYYY-MM-DD hh:mm:ss');
   console.log('Current Time at: ', m)
   console.log("Session logged in user: ", req.session.user);
   console.log("Session logged in user expires: ", req.session._expires);
   if (m >  req.session._expires) {
     console.log("Time out - deleting session...");
       req.session.destroy();
   } else {
     console.log("Session time is ok...");
   }

   console.log("Post searchString : ",req.body.searchString);

// wenn eine Suche ausgeführt wurde
   if (typeof req.body.searchString !== 'undefined') {
     // setzte Suchstring auf Wildcard - Alles
     var searchString = "%" + req.body.searchString + "%";

   } else  { // sonnst
     // setzte Suchstring auf Wildcard - Alles
     var searchString = "%"
   }


   console.log("Phonebook searchString: ", searchString);

   const  query = {
     name: 'searchQuery',
     text: `SELECT entrie_id, title, name, surname, tel, mtel, mail, company, department
     FROM entries
     where (name ILIKE $1)
     or (title ILIKE $1)
     or (name ILIKE $1)
     or (surname ILIKE $1)
     or (tel  ILIKE $1)
     or (mtel  ILIKE $1)
     or (mail  ILIKE $1)
     or (company  ILIKE $1)
     or (department  ILIKE $1)
     ORDER BY company,department,surname,name ;`,
     values: [searchString],
   }
//  console.log("Query: ", query);

//.then(() => client.query('SELECT title as Titel, name as Name, surname as Nachname, tel as Tel, mtel as Mobil, mail as Mail, company as Firma, department as Abteilung FROM entries ORDER BY company,department,surname,name;'))
   client.connect()
     .then(() => client.query(query))
     .then((results) => {
       console.log('SQL Results row count: ', results.rowCount);




       res.render('entrie-list', {
         entries: results.rows,
         // eingegebenen Suchstring nochmal zurück geben, damit diesr in der inputbox wieder zu sehen ist.
         search: req.body.searchString
       });

     })
     .catch((err) => {
       console.log('Datenbankfehler: %s ', err);
       var errstring = 'Database Error:  <br>' + err + '<br><br><a href="/entries">back</a>';
       res.send(errstring);
     });
 };


 module.exports = {
   pageView
 };
