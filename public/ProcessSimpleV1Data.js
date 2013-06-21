$.ajaxSetup({'async' : false}); $.getScript('ProcessV1Data.js');
$.ajaxSetup({'async' : true});

function ProcessSimpleV1Data() {
  ProcessV1Data.call(this);
  
  this.displayAll = false;
  this.class = 'ProcessSimpleV1Data';
};

ProcessSimpleV1Data.prototype = new ProcessV1Data();
ProcessSimpleV1Data.prototype.constructor = ProcessSimpleV1Data;

ProcessSimpleV1Data.prototype.updateURL = function(data) {
  result = getV1URL(this.items[0], '', PROJECT);
  
  this.url = result;
};

ProcessSimpleV1Data.prototype.setDisplayAll = function(level) { 
  this.displayAll = level;  
};

ProcessSimpleV1Data.prototype.prepareResults = function(result, date) { 
  this.setData(result); 
};

ProcessV1Data.prototype.collectResults = function() { 
  this.setResults(this.getData());
  
  this.display();
};

ProcessSimpleV1Data.prototype.computeAll = function(iterator) {  // display as a chart (default)
  this.count = 0;
  this.updateNotify();
  this.updateURL(null);
  
  this.compute(this.getURL(), null);
};

ProcessSimpleV1Data.prototype.display = function() {  // display as a chart (default)
  document.getElementById(this.type).innerHTML = this.format(this.displayAll);
};

ProcessSimpleV1Data.prototype.format = function(full) {
};