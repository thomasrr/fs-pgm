$.ajaxSetup({'async' : false}); $.getScript('Iteration.js');
$.ajaxSetup({'async' : false}); $.getScript('dashboardUtils.js');
$.ajaxSetup({'async' : true});

function DailyIteration(project) {
  Iteration.call(this);
  this.items = [];
  this.increment = 1;   // number of days in each step
  this.project = project;
  this.class = 'DailyIteration';
};

DailyIteration.prototype = new Iteration();
DailyIteration.prototype.constructor = DailyIteration;

DailyIteration.prototype.updateURL = function(data) {
};

DailyIteration.prototype.collectResults = function(date) {  // combine stored data and value; display results 
  var temp = new Array(); 
  
  var start = createDate(this.project.findStartDate());
  var last = createDate(this.project.computeEndDate());
	
  while (start < last) {
	temp.push(new Date(start));
	start.setDate(start.getDate() + this.increment);
  }
  if (start > last) temp.push(last);

  this.result = temp;
  
  this.display(this.displayAll);
};

DailyIteration.prototype.computeAll = function() {
  this.collectResults(null);
};

DailyIteration.prototype.compute = function() {
};

DailyIteration.prototype.prepareResults = function() {
  this.collectResults(null);
};

