var express = require('express');

var app = express();

app.use(express.static(__dirname + '/public'));
//app.set('view engine', 'html');
//app.set('views', __dirname);

var port = process.env.PORT || 5000;
app.listen(port);