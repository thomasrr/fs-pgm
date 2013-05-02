var express = require('express');
var fsData = require('./public/fs-pgm-data');

var app = express();

app.use(express.static('/public'));
//app.use(express.basicAuth('fs-pgm', 'dashboard'));

app.configure(function () {
  app.use(express.logger('dev')); /* 'default', 'short', 'tiny', 'dev' */
  app.use(express.bodyParser());
});

app.get('/mongo/:id', fsData.getItem);
app.post('/mongo/:id', fsData.setItem);
app.delete('/mongo/:id', fsData.clear);

var port = process.env.PORT || 5000;
app.listen(port);
console.log ('Listening at port ' + port + '...');