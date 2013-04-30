var mongo = require('mongodb');
 
var Server = mongo.Server;
var Db = mongo.Db;
var BSON = mongo.BSONPure;
 
var server = new Server('localhost', 27017, {auto_reconnect: true});
db = new Db('metricsDB', server);
 
db.open(function(err, db) {
  if(!err) {
//    console.log("Connected to 'metricsDB' database");
    db.collection('metricsDB', {strict:true}, function(err, collection) {
//      populateDB();
      if (err) {
        console.log("The 'metricsDB' collection doesn't exist. Need to load data...");
      }
    });
  }
});
 
exports.getItem = function(req, res) {
  var id = req.params.id;   // expecting 'id' 
//  console.log('Retrieving: ' + JSON.stringify(id));
  db.collection('metricsDB', function(err, collection) {
    collection.findOne({'id':id}, function(err, item) {
      if (err) {
		console.log ("getItem err: " + JSON.stringify(err));
	    res.send({'error': 'error occurred in setItem'});
      }
	  else {
//	  console.log ("getItem item: " + JSON.stringify(item));
	    res.send(item);
	  }
    });
  });
};

exports.setItem = function(req, res) {  // overwrites if id exists
  var id = req.params.id;   // expecting 'id'     
  var data = req.body.value;  	// expecting 'data' 
//  console.log('Updating: ' + id);
//  console.log('  with data: ' + JSON.stringify(data));
  db.collection('metricsDB', function(err, collection) {
    collection.update({'id':id}, {'id':id, 'value':data}, {upsert: true}, function(err, item) {
	  if (err) {
	    console.log ('Error(set): {' + err + '}');
        res.send({'error': 'error occurred in setItem'});
	  }
	  else {
//	    console.log ('Updated: {' + JSON.stringify(id) + ':' + JSON.stringify(item) + '}');
        res.send(item);
	  }
    });
  });
};

exports.clear = function(req, res) {
  var id = req.params.id;   // expecting 'id'  || 'all'
//  console.log('Clearing: ' + JSON.stringify(data));
  db.collection('metricsDB', function(err, collection) {
    collection.remove({'id':id}, function(err, item) {
      if (err) {
	    console.log ('Error(clear): {' + err + '}');
        res.send({'error': 'error occurred in clear'});
	  }
	  else {
//	    console.log ('Deleted: {' + JSON.stringify(id) + '}');
        res.send(item);
	  }
    });
  });
};
