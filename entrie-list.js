 const { Client } = require('pg');

const pageView = (req, res) => {
  const client = new Client();
  // console.log('Requested page: ' + Object.getOwnPropertyNames(req));
  console.log('Client: ' + req.connection.remoteAddress);
  console.log('Request: ' + req.url);


  //const client = new Client();
  client.connect()
    .then(() => client.query('SELECT * FROM entries;'))
    .then((results) => {
      console.log('SQL Results row count: ', results.rowCount);
      res.render('entrie-list', {
        entries: results.rows
      });

    })
    .catch((err) => {
      console.log('Datenbankfehler: %s ', err);
      var errstring = 'Database Error:  <br>' + err + '<br><br><a href="/entries">back</a>';
      res.send(errstring);
    });
};

/*
const pageGet = (req,res) => {
  console.log("Page Get");
  const client = new Client();
  client.connect()
    .then(() => client.query('SELECT * FROM entries;'))
    .then((results) => {
      console.log('SQL Results row count: ', results.rowCount);
      res.sendFile('entrie-list', {
        entries: results.rows
      });

    })
    .catch((err) => {
      console.log('Error: %s ', err);
      var errstring = 'Error:  <br>' + err + '<br><br><a href="/entries">back</a>';
      res.send(errstring);
    });

};
*/

module.exports ={
  pageView  
};
