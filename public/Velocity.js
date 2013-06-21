$.ajaxSetup({'async' : false}); $.getScript('ProcessV1Data.js');
$.ajaxSetup({'async' : false}); $.getScript('VelocityChart.js');
$.ajaxSetup({'async' : true});

function Velocity() {
  ProcessV1Data.call(this);

  this.items = ['VeloStory', 'VeloDefect'];
  this.increment = 1;
  this.itemPosn = 0;
  this.chart = new VelocityChart();
  this.class = 'Velocity';
};

Velocity.prototype = new ProcessV1Data();
Velocity.prototype.constructor = Velocity;

Velocity.prototype.prepareResults = function(result, date) {  // combine stored data and value 
  var sum = 0;
   
  if (result.Assets.length > 0) {
	for (var incr = 0; incr < result.Assets.length; incr++) {
	  sum += result.Assets[incr].Attributes.Estimate.value;
	}
    this.pushData([date, sum]);
  }
  this.updateNotify();
};

Velocity.prototype.collectResults = function() {  // combine stored data and value 
  var tmpData = this.getData();
  
  this.loadResults();
  for (var incr = 0; incr < tmpData.length; incr++) {
    var date = new Date(tmpData[incr][0]);
    this.pushResults([date.valueOf(), tmpData[incr][1]]);
  }
  this.setResults(computeVelocity(orderV1Data(this.getResults())));
 
  this.display();
   
  this.storeResults();
};

Velocity.prototype.display = function() {
  var results = this.getResults();
  var chart = this.chart;
  var average = chart.computeAverage(results);
  var avgPlot = [[results[0][0], average], [results[results.length-1][0], average]];
  
  chart.addData('actual', 'darkred', results);
  chart.addData('average', 'darkblue', avgPlot, 'Dash', 'line');
  chart.display();
};

function computeVelocity(data) {
  var last = 0;
  for (var incr = 0; incr < data.length; incr++) {   // compute velocity of accumulated data
	var tmp = data[incr][1];
	data[incr][1] -= last;
	last = tmp;
  }
  
  return data;
};
