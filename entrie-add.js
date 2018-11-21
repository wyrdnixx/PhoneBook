const { Client } = require('pg');
/*
module.exports =  (req,res) => {
  res.render('entrie-form');
  console.log('Requested page: ' + req.url);
};

*/

const appget = (req,res) => {
  res.render('entrie-form');
  console.log('Requested page: ' + req.url);
};


const apppost = (req, res) => {
  console.log('in entrieAdd.AppPost mehtode');
  console.log('post body', req.body);
  const client = new Client();
  client.connect()
    .then(() => {
      console.log('connection to Database complete');
      // do query
      const sql = 'INSERT INTO entries (title, name, surname, tel, mtel, mail, company, department) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)'
      const params = [req.body.title, req.body.name, req.body.surname,  req.body.tel, req.body.mtel, req.body.mail, req.body.company, req.body.department];
      return client.query(sql, params);
    })
    .then((result) => {
      console.log('Insert to Database -> Title: %s  - Author: %s', req.body.title, req.body.authors);
      console.log('sql result Rows (Erfolg: result >0) : ', result.rowCount);
    })
    .catch((err) => {
      console.log('Datenbankfehler: %s', err);
      //  res.redirect('/list');
    });
  res.redirect('/entries');
};

module.exports ={
  appget,
  apppost
};
