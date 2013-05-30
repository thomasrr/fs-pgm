$.ajaxSetup({'async' : false});
$.getScript('ProcessSimpleV1Data.js');
$.ajaxSetup({'async' : true});

function Iterator(schedule) {
  ProcessSimpleV1Data.call(this);
  this.items = ['Iteration'];
  this.current = -1;
  this.max = 0;
  this.dates = new Array();
  this.schedule = schedule;
}

Iterator.prototype = new ProcessSimpleV1Data();
Iterator.prototype.constructor = Iterator;

Iterator.prototype.getDate = function() {
  return dates[this.current];
}

Iterator.prototype.getNext = function() {
  var result = (this.current >= this.max);
  console.log('getNext: ' + result);
  
  this.current++;
  
  return result;
}

Iterator.prototype.reset = function() {
  this.current = -1;
}

Iterator.prototype.updateURL = function(data) {
  var result = getV1URL(this.items[0], '') + this.schedule;
  
  this.url = result;
}

