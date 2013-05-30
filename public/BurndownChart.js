$.ajaxSetup({'async' :false});
$.getScript('PGMChart.js');
$.ajaxSetup({'async' :true});

function BurndownChart() {
  PGMChart.call(this);
  this.type = 'line';
  this.xType = 'datetime';
  this.yTitle = 'Total Story Estimate';
}

Burndown.prototype = new PGMChart();
Burndown.prototype.constructor = BurndownChart;