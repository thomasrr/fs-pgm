var populateDB = function() {
  var metrics = [ {
      id: 'V1user',
      name: 'rpt',
	  pass: 'harvest'
	},{
	  id: 'JIRAuser',
	  name: 'bireports',
	  pass: 'harvest'
	},{
	  id: 'general',
	  name: 'fs-pgm',
	  pass: 'dash'
	}];
	
	db.collection('metricsDB', function(err, collection) {
	  collection.insert(metrics, {safe:true}, function(err, result) {});
	});
};