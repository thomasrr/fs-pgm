$.ajaxSetup({'async' : false}); $.getScript('PGMChart.js');
$.ajaxSetup({'async' : true});

function BurndownChart() {
  PGMChart.call(this);
  
  this.type = 'line';
  this.xType = 'datetime';
  this.yTitle = 'Total Story Estimate';
  this.renderTo = 'burndown';
  this.class = 'BurndownChart';
  this.dataType = 'Burndown';
}

BurndownChart.prototype = new PGMChart();
BurndownChart.prototype.constructor = BurndownChart;

BurndownChart.prototype.prepare = function() {
//    this.showLegend = (this.renderTo != 'burndown');
};

