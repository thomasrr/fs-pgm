var express = require('express');

var app = express.createServer(express.logger());

app.get('/', function(request, response) {
  res.type('.html');
  res.sendfile('C:/Users/rrthomas/Desktop/Projects/Code/', 'metricsDashboard.html');
});

var port = process.env.PORT || 5000;
app.listen(port, function() {
  console.log("Listening on " + port);
});