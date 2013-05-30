$.ajaxSetup({'async' :false});
$.getScript('ProcessV1Data.js');
$.ajaxSetup({'async' :true});

function ProcessSimpleV1Data() {
  ProcessV1Data.call(this);
  
  this.displayAll = false;
}

ProcessSimpleV1Data.prototype = new ProcessV1Data();
ProcessSimpleV1Data.prototype.constructor = ProcessSimpleV1Data;

ProcessSimpleV1Data.prototype.updateURL = function(data) {
  result = getV1URL(this.items[0], '');
  
  this.url = result;
}

ProcessSimpleV1Data.prototype.setDisplayAll = function(level) { 
  this.displayAll = level;  
}

ProcessSimpleV1Data.prototype.prepareResults = function(results, data) { 
  this.setResults(results);  
}

ProcessSimpleV1Data.prototype.collectResults = function(data) {  // combine stored data and value; display results 
  this.display(this.displayAll);
}

ProcessSimpleV1Data.prototype.computeAll = function(iterator, data) {  // display as a chart (default)
  this.compute(this.getURL(), data);
}

ProcessSimpleV1Data.prototype.display = function() {  // display as a chart (default)
  document.getElementById(this.type).innerHTML = this.format(this.displayAll);
}

ProcessSimpleV1Data.prototype.format = function(full) {
}