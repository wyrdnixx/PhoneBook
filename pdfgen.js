const PDFDocument = require('pdfmake');

var pdfMake = require('pdfmake');
var PdfPrinter = require('pdfmake/src/printer');
var virtualfs = require('pdfmake/build/vfs_fonts');

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
    .then(() => client.query('SELECT * FROM entries;'))
    .then((results) => {
      console.log('SQL Results row count: ', results.rowCount);

      res.setHeader('Content-disposition', 'attachment; filename="' + filename + '"')
      res.setHeader('Contend-type', 'application/pdf')

      var contentjs = JSON.stringify(results.rows)
      var arr = JSON.parse(contentjs)


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


      function buildTableBody(data, columns) {
        var body = [];

        body.push(columns);

        data.forEach(function(row) {
          var dataRow = [];

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
          }
        };
      }

      /// So funzt es
      var dd = {
        content: [{
            text: 'Telefonliste', bold: true,
            style: 'header'
          },
          { // leere Zeile
            text: ' '
          },
          {
            image: 'images/logo.png',
            width: 150,
            absolutePosition: {x: 400, y: 10},style: 'header'
          },
          { // leere Zeile
            text: ' '
          },
            //    table(externalDataRetrievedFromServer, ['name', 'age'])
            table(results.rows, ['title', 'name', 'surname', 'tel', 'mtel', 'mail', 'company', 'department']),
          {
            text: 'EnteEnte'
          },
          {
            text: 'BLABLA-BLUBLU', bold: true
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
