$.ajaxSetup({'async' : false}); $.getScript('ProcessSimpleV1Data.js');
$.ajaxSetup({'async' : false}); $.getScript('dashboardUtils.js');
$.ajaxSetup({'async' : true});

function Iteration(project) {
  ProcessSimpleV1Data.call(this);
  
  this.items = ['Iteration'];
  this.index = -1;
  this.ready = false;
  this.project = project;
  this.increment = 14;   // number of days in each iteration
  this.class = 'Iteration';
  
  this.hasNext = function(){ return this.index < this.result.length; };
};

Iteration.prototype = new ProcessSimpleV1Data();
Iteration.prototype.constructor = Iteration;

Iteration.prototype.current = function() {
  return this.result[this.index];
};

Iteration.prototype.ready = function() {
  return this.ready;
};

Iteration.prototype.next = function() {
  var result = false;
  
  if (this.hasNext()) {
    this.index++;
	result = this.current();
  }
//  console.warn('iterator: (' + this.index + ')' + this.hasNext());
  return result;
};

Iteration.prototype.reset = function() {
  this.index = -1;
};

Iteration.prototype.updateURL = function(data) {
  var result = getV1URL(this.items[0], '', this.project) + '"' + this.project.findSchedule() + '"';;

  this.url = result;
};

Iteration.prototype.display = function(data) {   // override default so no display
  this.ready = true;   // called from collectResults when collection is done
};

Iteration.prototype.collectResults = function(date) {  // combine stored data and value; display results 
  var temp = new Array();
  
  if (this.getData().total == 1) {
    var start = createDate(this.project.findStartDate());
	var today = createDate(this.project.computeEndDate());
	
	while (start < today) {
	  temp.push(new Date(start));
	  start.setDate(start.getDate() + this.increment);
	}
	if (start > today) temp.push(today);
  }
  else {
    var data = this.getData();
	
    for (var incr = 0; incr < data.total; incr++) {
	  temp.push(convertDate(data.Assets[incr].Attributes.BeginDate.value));
	}
    temp.push(convertDate(data.Assets[incr-1].Attributes.EndDate.value));
  }
  this.result = temp;
  
  this.display(this.displayAll);
};

