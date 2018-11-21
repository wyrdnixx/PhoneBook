require('dotenv').config();
const { Client } = require('pg');
const client = new Client();

client.connect()
  .then(() => {
    console.log('Connection to database successful');

    const sql = `CREATE TABLE entries (
      entrie_id serial primary key,
      title text,
      name text NOT NULL,
      surname text NOT NULL,
      tel text ,
      mtel text,
      mail text,
      company text NOT NULL,
      department text
    );`;

    return client.query(sql);
  })
  .then((result) => {
    console.log(result);
    process.exit();
  })
  .catch((err) => {
    console.log('Datenbankfehler: %s', err);
    process.exit();
  });
