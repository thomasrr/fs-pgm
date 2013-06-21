$.ajaxSetup({'async' : false}); $.getScript('PGMChart.js');
$.ajaxSetup({'async' : true});

function CycleChart() {
  PGMChart.call(this);
  
  this.type = 'line';
  this.xType = '';
  this.yTitle = '';
  this.tooltip = CycleFormatter;
  this.showLegend = false;
  this.renderTo = 'cycle';
  this.renderPage = 'cycleTab';
  this.class = 'CycleChart';
  this.dataType = 'Cycle Time';
}

CycleChart.prototype = new PGMChart();
CycleChart.prototype.constructor = CycleChart;

CycleChart.prototype.prepare = function() {
  this.showLegend = (this.renderTo == 'zoom');
};

CycleChart.prototype.displayPage = function() {
	buildCyclePage(this.renderPage, this.dataSeries);
	
	for (var incr = 0; incr < this.dataSeries.length; incr++) {
	  var chart = new CycleChart();
	  chart.xType = '';
		
	  chart.renderTo = cycleID(this.dataSeries[incr].name, this.renderPage);
	  chart.addData(this.dataSeries[incr].name, this.dataSeries[incr].color, this.dataSeries[incr].data);
	  chart.display();
	}
};

function CycleFormatter() { 
  return '<strong>Cycle Time for ' + this.x + ' is ' + this.y.toFixed(2) + '</strong>';
};

function cycleID(label, page) {
  var result = label.replace(/ /g, "_");
  
  result = result.replace(/\//g,"_");
  result += "_" + page;
  
  console.warn('ID: ' + result);
  
  return result;
}

function formatChart(label, page) {
  var result = divCreate('span4');
  var labelID = cycleID(label, page);
  result.appendChild(chartCreate(label, 'smallChart', (labelID + 'Legend'), labelID));

  return result;
}

function buildCyclePage(renderTo, headers) {
  var elem = document.getElementById(renderTo); 
  
  for (var incr in headers) {
    var row;

	if ((incr % 3) == 0) {
	  row = divCreate('row-fluid');
	  elem.appendChild(row);
	}
    row.appendChild(formatChart(headers[incr].name, renderTo));
  }
}