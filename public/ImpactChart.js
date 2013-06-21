$.ajaxSetup({'async' : false}); $.getScript('PGMChart.js');
$.ajaxSetup({'async' : true});

function ImpactChart() {
  PGMChart.call(this);
  
  this.type = 'column';
  this.yTitle = 'Stories Changed';
  this.tooltip = ImpactFormatter;
  this.showLegend = false;
  this.renderTo = 'impact';
  this.class = 'ImpactChart';
  this.dataType = 'Story';
}

ImpactChart.prototype = new PGMChart();
ImpactChart.prototype.constructor = ImpactChart;

ImpactChart.prototype.getPlotOptions = function() {
  return { column: { stacking: 'normal' }
		 };
};

ImpactChart.prototype.prepare = function() {
  this.showLegend = (this.renderTo != 'impact');
};

function ImpactFormatter() {
  var locDate = new Date(this.x);
							 
  return '<strong>'+ locDate.toLocaleDateString() + '</strong><br/>' + 
         this.series.name + ': ' + this.y + '<br/>Total: ' + this.point.stackTotal;
};