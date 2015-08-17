 Parser =  require ('cobolscript').complete().Parser;

 var fs = require('fs');



var p = new Parser();


fs.readFile('./test-cob', 'utf8', function (err,data) {
  if (err) {
    return console.log(err);
  }

  console.log(p.parseProgram(data))
  
});