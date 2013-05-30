$.ajaxSetup({'async' :false});
$.getScript('StorageDB.js');
$.getScript('PGMChart.js');
$.ajaxSetup({'async' :true});

function ProcessV1Data() {
  this.data = new Array();
  this.result = 0;
  this.type = '';
  this.url = '';
  this.items = [];
  this.increment = 0;
  this.count = 0;     // number of compute calls
  this.storage = new StorageDB();
  this.chart = new PGMChart();
}

ProcessV1Data.prototype.getChart = function() {
  return this.chart;
}

ProcessV1Data.prototype.getType = function() {
  return this.type;
}

ProcessV1Data.prototype.prepareDisplay = function() {  
}

ProcessV1Data.prototype.display = function() {  // display as a chart (default)
  this.chart.display();
}

ProcessV1Data.prototype.setData = function(data) {  // save temporary values
  this.data = data;
}

ProcessV1Data.prototype.pushData = function(data) {  // save partial temporary values
  this.data.push(data);
}

ProcessV1Data.prototype.getData = function() {  // get temporary values
  return this.data;
}

ProcessV1Data.prototype.updateURL = function(data) {
}

ProcessV1Data.prototype.getURL = function() {
  return this.url;
}

ProcessV1Data.prototype.setResults = function(result) {
  this.result = result;
}

ProcessV1Data.prototype.getResults = function() {
  return this.result;
}

ProcessV1Data.prototype.loadResults = function() {  // get stored data (overwrite result)
//  this.result = this.storage.getValue();
}

ProcessV1Data.prototype.storeResults = function() {
//  this.storage.setValue(this.result);
}

ProcessV1Data.prototype.prepareResults = function(results, data) {   
}

ProcessV1Data.prototype.collectResults = function(data) {  // combine stored data and value 
}

ProcessV1Data.prototype.computeAll = function(iterator, data) {  // get all data from V1 (uses iterator)
  while (iterator.getNext()) {
    this.updateURL(iterator.getDate());
    this.compute(this.getURL(), data);
  }
}

ProcessV1Data.prototype.compute = function(urlStr, data) {  // get data from V1 (single REST call)
  var self = this;
  
  self.count++;
  $.ajax({
    url: urlStr,
	headers: getV1Headers(),
	type: 'GET',
	crossDomain: true,
	dataType: 'jsonp',
	success: function(result) {
//	    console.log(JSON.stringify(result));
	  self.count--;
	  self.prepareResults(result, data);
	  
	  if (self.count == 0) self.collectResults(data);
	},
	error: function(errStr) {
	  self.count--;
	  console.log('Error: ' + JSON.stringify(errStr));
	}
  });
}

