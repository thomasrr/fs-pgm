var DEFAVGSIZE = 0;
var DEFVELINCR = 1;

function calculate() {
  var endDate = 0;
  var projDate = 0;
  var avgSize = DEFAVGSIZE;
  var velIncr = DEFVELINCR;
  var burndown = { value: 0, data: 0 };
  var cycles = { value: 0, data: 0 };
  var velocity = { value: 0, ready: false, data: 0 };
  var impact = { value: 0, data: 0 };
  var iteration = { value: 0, ready: false, data: 0 };
  var defect = { data: 0 };
  var story = { data: 0 };
  var issues = { data: 0};
  
  return {
    init: function() {
	  endDate = 0;
      projDate = 0;
      avgSize = DEFAVGSIZE;
      velIncr = DEFVELINCR;
      burndown = { value: 0, data: 0 };
	  cycles = { value: 0, data: 0 };
      velocity = { value: 0, ready: false, data: 0 };
      impact = { value: 0, data: 0 };
      defect = { data: 0 };
      story = { data: 0};
      issues = { data: 0};
	  iteration = { value: 0, ready: false, data: 0 };
	  story.data = new Array();
	  cycles.data = new Array();
	  impact.data = new Array();
	},
    setEndDate: function(date) { endDate = date; },
	setProjDate: function(date) { projDate = date; },
	setAvgSize: function(size) { avgSize = (size < 0) ? DEFAVGSIZE : size; },
	setIncrement: function(size) { velIncr = (size < 0) ? DEFVELINCR : size; },
	setValue: function(type, value) {
	  if (type == 'burndown') {
	  	burndown.value = value;
	  }
	  else if (type == 'cycles') {
	  	cycles.value = value;
	  }
	  else if (type == 'velocity') {
	  	velocity.value = value;
	  }
	  else if (type == 'impact') {
	  	impact.value = value;
	  }
	  else if (type == 'iteration') {
	  	iteration.value = value;
	  }
	},
	setData: function(type, data) {
	  if (type == 'burndown') {
	    burndown.data = data;
	  }
	  else if (type == 'cycles') {
	    cycles.data = data;
	  }
	  else if (type == 'velocity') {
	  	velocity.data = data;
	  }
	  else if (type == 'impact') {
	  	impact.data = data;
	  }
	  else if (type == 'defect') {
	  	defect.data = data;
	  }
	  else if (type == 'story') {
	  	story.data = data;
	  }
	  else if (type == 'issues') {
	  	issues.data = data;
	  }
	  else if (type == 'iteration') {
	  	iteration.data = data;
	  }
	},
	incrementValue: function(type) {
	  if (type == 'burndown') {
	  	burndown.value++;
	  }
	  else if (type == 'cycles') {
	  	cycles.value++;
	  }
	  else if (type == 'velocity') {
	  	velocity.value++;
	  }
	  else if (type == 'impact') {
	  	impact.value++;
	  }
	},
	decrementValue: function(type) {	  
	  if (type == 'burndown') {
	  	burndown.value--;
	  }
	  else if (type == 'cycles') {
	  	cycles.value--;
	  }
	  else if (type == 'velocity') {
	  	velocity.value--;
		if (velocity.value == 0) velocity.ready = true;
	  }
	  else if (type == 'impact') {
	  	impact.value--;
	  }
	  else if (type == 'iteration') {
	    iteration.ready = true;
	  }
	},
	pushCycles: function(data) { cycles.data.push(data); },
	pushImpact: function(posn, data) { 
	  impact.data[posn] = new Array(); 
	  impact.data[posn].push(data); 
	},
	isReady: function(type) { 
	   if (type == 'velocity') {
	     return velocity.ready; 
	   }
	   else if (type == 'iteration') {
	     return iteration.ready;
	   }
	},
	getEndDate: function() { return endDate; },
	getProjDate: function() { return projDate; },
	getAvgSize: function() { return avgSize; },
	getIncrement: function() { return velIncr; },
	getValue: function(type) {
	  if (type == 'burndown') {
	  	return burndown.value;
	  }
	  else if (type == 'cycles') {
	  	return cycles.value;
	  }
	  else if (type == 'velocity') {
	  	return velocity.value;
	  }
	  else if (type == 'impact') {
	  	return impact.value;
	  }
	  else if (type == 'iteration') {
	  	return iteration.value;
	  }
	},
	getData: function(type) {
	  if (type == 'burndown') {
	    return burndown.data;
	  }
	  else if (type == 'cycles') {
	    return cycles.data;
	  }
	  else if (type == 'velocity') {
	    return velocity.data;
	  }
	  else if (type == 'impact') {
	    return impact.data;
	  }
	  else if (type == 'defect') {
	    return defect.data;
	  }
	  else if (type == 'story') {
	    return story.data;
	  }
	  else if (type == 'issues') {
	    return issues.data;
	  }
	  else if (type == 'iteration') {
	    return iteration.data;
	  }
	}
  };
}