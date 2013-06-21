$.ajaxSetup({'async' : false}); $.getScript('ImpactChart.js');
$.ajaxSetup({'async' : true});

function ResourceChart() {
  ImpactChart.call(this);
  
  this.xTitle = '';
  this.yTitle = 'Number of Stories';
  this.class = 'ResourceChart';
  this.renderTo = 'resource';
}

ResourceChart.prototype = new ImpactChart();
ResourceChart.prototype.constructor = ResourceChart;

ResourceChart.prototype.prepare = function() {
  this.showLegend = (this.renderTo != 'resource');
};