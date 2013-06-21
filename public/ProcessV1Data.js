$.ajaxSetup({'async' : false}); $.getScript('StorageDB.js');
$.ajaxSetup({'async' : false}); $.getScript('PGMChart.js');
$.ajaxSetup({'async' : true});

function ProcessV1Data() {
  this.data = new Array();
  this.result = new Array();
  this.url = '';
  this.items = [];
  this.itemPosn = 0;
  this.increment = 0;
  this.count = -1;     // number of compute calls
  this.storage = new StorageDB();
  this.chart = new PGMChart();
  this.class = 'ProcessV1Data';
};

ProcessV1Data.prototype.updateNotify = function() {
  this.chart.notify(this.count);
};

ProcessV1Data.prototype.nextItem = function() {
  this.itemPosn++;

  return (this.itemPosn < this.items.length);
};

ProcessV1Data.prototype.getChart = function() {
  return this.chart;
};

ProcessV1Data.prototype.prepareDisplay = function() {  
};

ProcessV1Data.prototype.display = function() {  // display as a chart (default)
  this.chart.display();
};

ProcessV1Data.prototype.setData = function(data) {  // save temporary values
  this.data = data;
};

ProcessV1Data.prototype.pushData = function(data) {  // save partial temporary values
  this.data.push(data);
};

ProcessV1Data.prototype.getData = function() {  // get temporary values
  return this.data;
};

ProcessV1Data.prototype.updateURL = function(date) {
  result = getV1URL(this.items[this.itemPosn], date, PROJECT);
  
  this.url = result;
};

ProcessV1Data.prototype.getURL = function() {
  return this.url;
};

ProcessV1Data.prototype.pushResults = function(result) {
  if (this.result == null) this.result = new Array();
  
  this.result.push(result);
};

ProcessV1Data.prototype.setResults = function(result) {
  this.result = result;
};

ProcessV1Data.prototype.getResults = function() {
  return this.result;
};

ProcessV1Data.prototype.loadResults = function() {  // get stored data (overwrite result)
//  this.result = this.storage.getValue();
};

ProcessV1Data.prototype.storeResults = function() {
//  this.storage.setValue(this.result);
};

ProcessV1Data.prototype.prepareResults = function(results, date) {   
};

ProcessV1Data.prototype.collectResults = function() {  // combine stored data and value 
  var tmpData = this.getData();
  
  this.loadResults();
  for (var incr = 0; incr < tmpData.length; incr++) {
	var date = new Date(tmpData[incr][0]);
    this.pushResults([date.valueOf(), tmpData[incr][1]]);
  }
  this.setResults(orderV1Data(this.getResults()));
 
  this.display();
   
  this.storeResults();
};

ProcessV1Data.prototype.computeAll = function(iterator) {  // get all data from V1 (uses iterator)
  this.count = 0;
  this.updateNotify();
  
  while (true) {
    while (iterator.next()) {
      var date = iterator.current();

      this.updateURL(date);
      this.compute(this.getURL(), date);
    }
	if (!this.nextItem()) break;
	
	iterator.reset();
  } 
};

ProcessV1Data.prototype.compute = function(urlStr, date) {  // get data from V1 (single REST call)
  var self = this;

  self.count++;
  $.ajax({
    url: urlStr,
	headers: getV1Headers(),
	type: 'GET',
	crossDomain: true,
	dataType: 'jsonp',
	success: function(result) {
//      console.warning(JSON.stringify(result));
	  self.count--;
	  self.prepareResults(result, date);
	  
	  if (self.count <= 0) self.collectResults();
	},
	error: function(errStr) {
	  self.count--;
	  console.error('compute(): ' + self.class + '\n' + JSON.stringify(self) + '\n==>' + JSON.stringify(errStr));
	}
  });
};

