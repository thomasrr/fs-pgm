$.ajaxSetup({'async' : false}); $.getScript('Iteration.js');
$.ajaxSetup({'async' : false}); $.getScript('dashboardUtils.js');
$.ajaxSetup({'async' : true});

function StoryIteration(project) {
  Iteration.call(this);
  
  this.items = ['CycleList'];
  this.index = -1;
  this.ready = false;
  this.project = project;
  this.class = 'StoryIteration';
  
};

StoryIteration.prototype = new Iteration();
StoryIteration.prototype.constructor = StoryIteration;


StoryIteration.prototype.updateURL = function(date) {
  this.url = getV1URL(this.items[0], date, this.project);
};

StoryIteration.prototype.computeAll = function(iterator) {  // get all data from V1 (uses iterator)
  var date = this.project.findStartDate();
  
  this.count = 0;
  this.updateNotify();
  this.updateURL(date);
  this.compute(this.getURL(), 'begin');
  
  date = this.project.computeEndDate();
  this.updateURL(date);
  this.compute(this.getURL(), 'end'); 
};

StoryIteration.prototype.prepareResults = function(results, data) {
  this.data.push([data, results]);
};

StoryIteration.prototype.collectResults = function(date) {  // combine stored data and value; display results 
  var data = this.getData();
  if (data.length < 2) return;
  
  var first = data[0][1];
  var last = data[1][1];
  
  if ((data[0][0] == 'end') || (first.total == 0)) {
    first = data[1][1];
	last = data[0][1];
  }
  
  for (var incr = 0; incr < first.total; incr++) {
    var found = false;
	for (var kont = 0; kont < last.total; kont++) {
	  if (last.Assets[kont].Attributes.Number.value == first.Assets[incr].Attributes.Number.value) {
	    found = true;
		break;
	  }
	}
	if (found == false) this.pushResults(first.Assets[incr].Attributes.Number.value);
  }
  
  this.display(this.displayAll);
};
  


