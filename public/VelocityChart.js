$.ajaxSetup({'async' : false}); $.getScript('PGMChart.js');
$.ajaxSetup({'async' : true});

function VelocityChart() {
  PGMChart.call(this);
  
  this.type = 'column';
  this.xType = 'datetime';
  this.yTitle = 'velocity / week';
  this.tooltip = VelFormatter;
  this.renderTo = 'velocity';
  this.class = 'VelocityChart';
  this.dataType = 'Velocity';
}

VelocityChart.prototype = new PGMChart();
VelocityChart.prototype.constructor = VelocityChart;

VelocityChart.prototype.prepare = function() {
  this.showLegend = (this.renderTo != 'velocity');
};

function VelFormatter() {
  if (this.series.name == 'average') {
	return '<strong>Average ' + this.y.toFixed(2) +'</strong><br/>' 
  }
  else {
    var locDate = new Date(this.x);
							 
    return '<strong>'+ this.series.name + " " + this.y.toFixed(2) +
	       '<br/>Week ending </strong>'+ locDate.toLocaleDateString();
  }
};