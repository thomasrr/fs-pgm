var srv = require('express');

var app = srv.createServer(srv.logger());

app.get('fs-dashboard-pgm', function(request, response) {
  response.sendfile('test.html');
});

var port = process.env.PORT || 5000;
app.listen(port);