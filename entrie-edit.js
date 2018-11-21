const { Client } = require('pg');

const appget = (req, res) => {

    console.log("Edit entrie ID: ", req.params.id);
    console.log('Request: ' + req.url);

    //console.log(Object.getOwnPropertyNames(req));

    const client = new Client();
    client.connect()
      .then(() => {
        const sql = 'SELECT * FROM entries WHERE entrie_id = $1;'
        const params = [req.params.id];
        console.log("query: ", sql,params);
        return client.query(sql, params);
      })
      .then((results) => {
        //  console.log('results? ', results);
        //res.render('entrie-edit', {
        res.render('entrie-edit', {
          entrie: results.rows[0]
        });
      })
      .catch((err) => {
        // console.log('SQL Error: ', Object.getOwnPropertyNames(err));
        console.log('SQL Error: ', err.message);
      });

  };


const apppost = (req,res) => {
  console.log(' request to edit entrie: ', req.params.id)
  const client = new Client();
  client.connect()
  .then(() => {
    console.log('connection to Database complete');
    console.log('post body', req.body);
    console.log('Updating : ',req.body.title, req.body.name, req.body.surname,  req.body.tel, req.body.mtel, req.body.mail, req.body.company, req.body.department);
    const sql = 'update entries set title  = $2, name  = $3, surname  = $4, tel  = $5, mtel  = $6, mail  = $7, company = $8, department  = $9 where entrie_id = $1;'
    const params = [req.params.id, req.body.title, req.body.name, req.body.surname,  req.body.tel, req.body.mtel, req.body.mail, req.body.company, req.body.department];
    return client.query(sql, params);
  })
  .then((result) => {
    console.log('Insert to Database -> %s - %s - %s - %s - %s - %s - %s - %s - %s', req.params.id, req.body.title, req.body.name, req.body.surname,  req.body.tel, req.body.mtel, req.body.mail, req.body.company, req.body.department);
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
