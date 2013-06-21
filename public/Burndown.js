$.ajaxSetup({'async' : false}); $.getScript('ProcessV1Data.js');
$.ajaxSetup({'async' : false}); $.getScript('BurndownChart.js');
$.ajaxSetup({'async' : true});

function Burndown() {
  ProcessV1Data.call(this);
  
  this.items = ['BurnStory', 'BurnDefect'];
  this.increment = 1;
  this.velocity = null;
  this.chart = new BurndownChart();
  this.class = 'Burndown';
};

Burndown.prototype = new ProcessV1Data();
Burndown.prototype.constructor = Burndown;

Burndown.prototype.prepareResults = function(result, date) {  // combine stored data and value 
  var sum = 0;

  if (result.Assets.length > 0) {
	for (var incr = 0; incr < result.Assets.length; incr++) {
	  sum += result.Assets[incr].Attributes.Estimate.value;
	}
    this.pushData([date, sum]);
  }
  this.updateNotify();
};

Burndown.prototype.setVelocity = function(velocity) {
  this.velocity = velocity;
};

Burndown.prototype.display = function() {
  var results = this.getResults();
  var chart = this.chart;
  
  chart.addData('actual', 'darkred', results);
  chart.addData('ideal', '#669933', this.computeIdealLine(), 'Dot'); 
  chart.addData('forecast', 'darkblue', this.computeForecast(), 'Dash');
  chart.display();
};

Burndown.prototype.computeIdealLine = function() {
  var line = this.getResults();
  var result = new Array();
  var maxVal = 0;
  
  if (line.length < 1) return result;
  
  for (var incr = 0; incr < line.length; incr++) {   // compute max value
    if (line[incr][1] > maxVal) maxVal = line[incr][1];
  }
  result.push ([line[0][0], maxVal]);
  result.push ([line[line.length-1][0], 0]);
  
  return result;
};

Burndown.prototype.computeForecast = function() {
  var computed = new Array();  
  var actual = this.getResults();
  if ((actual.length == 0) || (this.velocity == null)) return computed;
  
  var velocity = this.chart.computeAverage(this.velocity.getResults());
  if (velocity == 0.0) return computed;
  
  var nextDay = actual[actual.length - 1][0];
  var nextValu = actual[actual.length - 1][1];
  var increment = WEEK * this.increment;
  computed.push([nextDay, nextValu]);
  
  while (nextValu > 0.0) {
  	nextValu -= velocity;
	if (nextValu < 0.0) {
	  nextDay += parseInt(increment * ((velocity + nextValu) / velocity));
	  nextValu = 0.0;
	}
	else {
	  nextDay += increment;
	}
  }
  computed.push([nextDay, nextValu]);	
				
  return computed;
};
