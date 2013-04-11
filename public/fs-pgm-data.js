var mongo = require('mongodb');
 
var Server = mongo.Server;
var Db = mongo.Db;
var BSON = mongo.BSONPure;
 
var server = new Server('localhost', 27017, {auto_reconnect: true});
db = new Db('metricsDB', server);
 
db.open(function(err, db) {
  if(!err) {
    console.log("Connected to 'metricsDB' database");
    db.collection('metricsDB', {strict:true}, function(err, collection) {
      if (err) {
        console.log("The 'metricsDB' collection doesn't exist. Need to load data...");
//		populateDB();
      }
    });
  }
});
 
exports.getItem = function(req, res) {
  var id = req.params.id;   // expecting { id: 'id' }
  console.log('Retrieving data: ' + JSON.stringify(id));
  db.collection('metricsDB', function(err, collection) {
    collection.findOne(id, function(err, item) {
      res.send(item);
	  console.log ("getItem item: " + JSON.stringify(item));
	  console.log ("getItem err: " + JSON.stringify(err));
    });
  });
};

exports.setItem = function(req, res) {
  var data = req.body;     // expecting { id: 'id', data: 'data' }  -- overwrites if id exists
  console.log('Updating data: ' + JSON.stringify(data));
  db.collection('metricsDB', function(err, collection) {
    collection.findOne({'_id':new BSON.ObjectID(id)}, function(err, item) {
      res.send(item);
    });
  });
};

exports.clear = function(req, res) {
  var data = req.body;     // expecting { id: 'id' } || { id: 'all' }
  console.log('Clearing data: ' + JSON.stringify(data));
  db.collection('metricsDB', function(err, collection) {
    collection.findOne({'_id':new BSON.ObjectID(id)}, function(err, item) {
      res.send(item);
    });
  });
};

