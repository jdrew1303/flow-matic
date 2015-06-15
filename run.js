//var fs = require('fs');
var Parser = require('./public/javascripts/flow-matic.js');



// a ='000009        01  WS-AREA-TRANSF-BANCO.                                      \n'+
// '000010            03 WS-GSBS-BANCO.                                          \n'+
// '000011               05 WS-GSBS-ERR-BANCO            PIC  9(0004).           \n'+
// '000012               05 WS-GSBS-TIP-ERR-BANCO        PIC  9(0001).           \n'+
// '000013               05 WS-GSBS-SQLCODE-BANCO        PIC  9(0008).           \n'+
// '000014               05 FILLER                       PIC  X(0007).           \n'+
// '000015            03 WS-CONTROLE-BANCO.                                      \n'+
// '000016               05 WS-CODIGO-RETORNO            PIC  9(0003).           \n'+
// '000017               05 WS-SINAL-SQLCODE             PIC  X(0001).           \n'+
// '000018               05 WS-SQLCODE                   PIC  9(0004).           \n'+
// '000019               05 WS-SQLERRML                  PIC  9(0004).           \n'+
// '000020               05 WS-SQLERRMC                  PIC  X(0070). \n'+
// '000021               05 WS-NM-TABELA-ERR             PIC  X(0018). \n'+
// '000022               05 WS-CD-EXCLUIDO               PIC  X(0001). \n'+
// '000023               05 WS-CD-EXISTE                 PIC  X(0001). \n'+
// '000024            03 WS-CHAVE-BANCO.                               \n'+
// '000025               05 WS-CD-BANCO-EXTERNO          PIC  9(0004). \n'+
// '000026               05 WS-CD-BANCO-INTERNO          PIC  9(0004). \n'+
// '000027            03 WS-DADOS-BANCO.                               \n'+
// '000028               05 WS-CD-PESSOA                 PIC  9(0018). \n'+
// '000029               05 WS-NOME-BANCO                PIC  X(0050). \n'+
// '000030               05 WS-CNPJ-BANCO                PIC  9(0014). \n'+
// '000031               05 WS-DV-BANCO                  PIC  X(0001). \n'+
// '000032               05 WS-SIGLA-BANCO               PIC  X(0015). \n'+
// '000033               05 WS-DATA-CADASTRO-BANCO       PIC  X(0010). \n'+
// '000034               05 WS-CD-RESP-BANCO             PIC  X(0008). \n'+
// '000035               05 WS-DT-HR-ULT-ATU-BANCO       PIC  X(0026). '

var p = new Parser();

// //console.log(p.parse(a))

if (!process.argv[2]) return console.error('\n\tMISSING SOURCE FILE PATH!\n\tUSE: node app.js <source file> <result file>');
if (!process.argv[3]) return console.error('\n\tMISSING RESULT FILE PATH!\n\tUSE: node app.js <source file> <result file>');


fs.readFile(process.argv[2], 'utf8', function (err,data) {
  if (err) {
    return console.log(err);
  }
  
  	fs.writeFile(process.argv[3], ImplFactory.buildImpl(p.parse(data)), function(err) {
		if(err) {
			console.log(err);
		} else {
			console.log("The file C:/books/book.java saved!");
		}
	}); 
});