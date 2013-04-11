var express = require('express');
var fsData = require(__dirname + '/public/fs-pgm-data');

var app = express();

app.use(express.static(__dirname + '/public'));
//app.use(express.basicAuth('fs-pgm', 'dashboard'));

app.configure(function () {
  app.use(express.logger('dev')); /* 'default', 'short', 'tiny', 'dev' */
  app.use(express.bodyParser());
});

app.get('/fs-pgm-data/:id', fsData.getItem);
app.post('/fs-pgm-data', fsData.setItem);
app.delete('/fs-pgm-data', fsData.clear);

var port = process.env.PORT || 5000;
app.listen(port);
console.log ('Listening at port ' + port + '...');