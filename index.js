"use strict";
var csv = require('fast-csv');
var fs = require('fs');
var fileHelper = require('./FileHelper');
var csvPath = "data/campos.csv";
var command = 'create';
process.argv.forEach(function (val, index, array) {
    if (val.split('=')[1] !== undefined) {
        val = val.split('=')[1];
    }
    if (fileHelper.isFilePathCSV(val)) {
        try {
            var stats = fs.statSync(val);
            csvPath = val;
        }
        catch (err) {
            console.log("Arquivo " + val + " n\u00E3o existe.");
            process.exit();
        }
    }
    switch (val) {
        case "create":
            command = 'create';
            break;
        case "drop":
            command = 'drop';
            break;
    }
});
var retorno = '';
if (command == 'create') {
    var csvStream_1 = csv.fromPath(csvPath, { headers: true, objectMode: true })
        .on("data", function (data) {
        var stringTipo = '';
        var tamanhoMax = data.tammax.split(':');
        switch (data.tipo) {
            case "C":
                stringTipo = "VARCHAR(" + data.tammax + ")";
                break;
            case "N":
                if (tamanhoMax.length > 1) {
                    stringTipo = "NUMBER(" + tamanhoMax[0] + ", " + tamanhoMax[1] + ")";
                }
                else {
                    stringTipo = "NUMBER(" + tamanhoMax[0] + ")";
                }
                break;
            case "xml":
                stringTipo = "CLOB";
                break;
            default:
                console.log("----> Tipo " + data.tipo + " n\u00E3o tem defini\u00E7\u00E3o.");
                process.exit();
        }
        retorno = retorno + '\n' + ("ALTER TABLE DEMO." + data.tabela + " ADD " + data.nome + " " + stringTipo + ";");
    })
        .on("end", function () {
        console.log(retorno);
    });
}
else if (command = 'drop') {
    var csvStream = csv.fromPath(csvPath, { headers: true, objectMode: true })
        .on("data", function (data) {
        var stringTipo = '';
        switch (data.tipo) {
            case "C":
                stringTipo = "VARCHAR(" + data.tammax + ")";
                break;
            case "N":
                var tamanhoMax = data.tammax.split(':');
                stringTipo = "NUMBER(" + tamanhoMax[0] + ", " + tamanhoMax[1] + ")";
                break;
            case "xml":
                stringTipo = "CLOB(" + data.tammax + ")";
                break;
            default:
                console.log("----> Tipo " + data.tipo + " n\u00E3o tem defini\u00E7\u00E3o.");
                process.exit();
        }
        retorno = retorno + '\n' + ("ALTER TABLE DEMO." + data.tabela + " DROP COLUMN " + data.nome + ";");
    })
        .on("end", function () {
        console.log(retorno);
    });
}
