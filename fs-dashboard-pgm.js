var srv = require('express');

var app = srv.createServer(srv.logger());

app.get('/', function(request, response) {
  response.send('test.html');
});

var port = process.env.PORT || 5000;
app.listen(port);