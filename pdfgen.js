const PDFDocument = require('pdfmake');

var pdfMake = require('pdfmake');
var PdfPrinter = require('pdfmake/src/printer');
var virtualfs = require('pdfmake/build/vfs_fonts');
const moment = require('moment');

// lodash - um JSON Daten zu organisieren
var _ = require('lodash');

var fs = require('fs');
const {
  Client
} = require('pg');



module.exports = (req, res) => {
  const doc = new PDFDocument()
  let filename = encodeURIComponent('file.pdf')

  const client = new Client();
  console.log('Client: ' + req.connection.remoteAddress);
  console.log('Request: ' + req.url);


  //const client = new Client();
  client.connect()
    .then(() => client.query('SELECT * FROM entries ORDER BY company,department,surname,name;'))
    .then((results) => {
      console.log('SQL Results row count: ', results.rowCount);

      res.setHeader('Content-disposition', 'attachment; filename="' + filename + '"')
      res.setHeader('Contend-type', 'application/pdf')


      //var contentjs = JSON.stringify(results.rows)
      var jsonData = JSON.stringify(results.rows)
      var contentjs = _.groupBy(jsonData, "company");

      /// testweise nach company gruppieren
      var testdata = [{
          "entrie_id": 57,
          "title": "Hr. Dr.",
          "name": "sdfg",
          "surname": "dfghfgh",
          "tel": "67567",
          "mtel": "86976",
          "mail": "cjf@dgh.de",
          "company": "dfgdfh",
          "department": "gfgh"
        },
        {
          "entrie_id": 41,
          "title": "Herr Dr.",
          "name": "Axelsaft",
          "surname": "Schweiss",
          "tel": "0001",
          "mtel": "70004",
          "mail": "axelsaft@bla.com",
          "company": "FRI",
          "department": "Axel-Chirurgie"
        },
        {
          "entrie_id": 42,
          "title": "Herr Dr.",
          "name": "Heinrich",
          "surname": "Schweß",
          "tel": "5456465",
          "mtel": "70005",
          "mail": "5@bla.com",
          "company": "FRI",
          "department": "Axel-Chirurgie"
        }
      ]

      console.log("vorher", testdata);
      var grouped = _.groupBy(testdata, "company");
      console.log("nachher", grouped);
      ////  Test Gruppieren


      ////////////////////
      var fonts = {
        Roboto: {
          normal: 'fonts/arial.ttf',
          bold: 'fonts/bold.ttf',
          italics: 'fonts/arial.ttf',
          bolditalics: 'fonts/arial.ttf'
        }
      };
      var printer = new PdfPrinter(fonts);
      //var fs = require('fs');
      function getDate() {
        let m = moment().format('YYYY-MM-DD');
        console.log('Generating PDF at: ', m)
        return m
      }

      function buildTableBody(data, columns) {
        var body = [];
        body.push(columns);

        data.forEach(function(row) {
          var dataRow = [];
          //  console.log("PDF - Working Row: ", row);
          columns.forEach(function(column) {
            dataRow.push(row[column].toString());
          })

          body.push(dataRow);


        });

        return body;
      }


      function table(data, columns) {
        return {
          table: {
            headerRows: 1,
            body: buildTableBody(data, columns)
          },
          layout: {
            hLineWidth: function(i, node) {
              return (i === 0 || i === node.table.body.length) ? 2 : 1;
            },
            vLineWidth: function(i, node) {
              return (i === 0 || i === node.table.widths.length) ? 2 : 1;
            },
            hLineColor: function(i, node) {
              return (i === 0 || i === node.table.body.length) ? 'black' : 'gray';
            },
            vLineColor: function(i, node) {
              return (i === 0 || i === node.table.widths.length) ? 'black' : 'gray';
            },
            fillColor: function(i, node) {
              return (i % 2 === 0) ? '#CCCCCC' : null;
            },
          }
        }
      }


      /// So funzt es
      var dd = {
        pageSize: 'LEGAL',
        pageMargins: [20, 80, 20, 60],

        header: {

          columns: [{
              // usually you would use a dataUri instead of the name for client-side printing
              // sampleImage.jpg however works inside playground so you can play with it
              image: 'public/images/logo.png',
              width: 130,
              absolutePosition: {
                x: 400,
                y: 10
              }
            },
            {
              text: 'Telefonliste - ' + getDate(),
              bold: true,
              absolutePosition: {
                x: 50,
                y: 30
              }
            }
          ]
        },
        content: [

          /*{
            image: 'images/logo.png',
            width: 150,
            absolutePosition: {
              x: 400,
              y: 10
            },
            style: 'header'
          },
          { // leere Zeile
            text: ' '
          },*/
          //    table(externalDataRetrievedFromServer, ['name', 'age'])
          table(results.rows, ['title', 'name', 'surname', 'tel', 'mtel', 'mail', 'company', 'department']),
          //table(contentjs, ['title', 'name', 'surname', 'tel', 'mtel', 'mail', 'company', 'department']),


          {
            text: 'EnteEnteEnteEnteEnteEnteEnteEnteEnteEnteEnteEnteEnteEnte'
          },
          {
            text: 'BLABLA-BLUBLU',
            bold: true
          }
        ]
      }

      /*
            var docDefinition = {
              content: [
                'First paragraph',
                'Another paragraph, this time a little bit longer to make sure, this line will be divided into at least two lines'
              ]
            };
      */
      var pdfDoc = printer.createPdfKitDocument(dd);
      //  pdfDoc.pipe(fs.createWriteStream('./basics.pdf'));
      pdfDoc.pipe(res);
      pdfDoc.end();
      ////////////////////



    })
    .catch((err) => {
      console.log('Error: %s ', err);
      var errstring = 'Error:  <br>' + err + '<br><br><a href="/entries">back</a>';
      res.send(errstring);
    });
}
