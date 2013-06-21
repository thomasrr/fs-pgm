$.ajaxSetup({'async' : false}); $.getScript('Highcharts-3.0.1/js/highcharts.js');
$.ajaxSetup({'async' : true});

function PGMChart() {
  this.type = '';
  this.title = '';
  this.subTitle = '';
  this.xType = 'datetime';
  this.xTitle = '';
  this.yTitle = '';
  this.yGridLineStyle = 'Dash';
  this.tooltip = PGMFormatter;
  this.showLegend = true;
  this.dataSeries = new Array();
  this.renderTo = '';
  this.dataType = '';
};

PGMChart.prototype.prepare = function() {
};

PGMChart.prototype.notify = function(count) {
  var element = document.getElementById(this.renderTo);
  if (element == null) return;
  
  var begin = 'Loading';
  var count = (count > 0) ? '(' + count + ')' : '';
  var fini = ' ' + this.dataType + ' .....';

  element.innerHTML = begin + count + fini;
};

PGMChart.prototype.display = function() {
  if (this.dataSeries.length < 1) return;
  
  this.prepare();
  var result = new Highcharts.Chart({
		 chart: this.getChart(),
		 title: this.getTitle(),
		 subtitle: this.getSubTitle(),
		 xAxis: this.getXAxis(),
		 yAxis: this.getYAxis(),
		 tooltip: this.getTooltip(),
		 legend: this.getLegend(),
		 plotOptions: this.getPlotOptions(),
		 series: this.getSeries()});
		 
  return result;
};

PGMChart.prototype.addData = function(name, color, data, dashStyle, lineType) {
  var series = {};
  
  series.name = name;
  series.color = color;
  series.data = data;
  series.type = (lineType != undefined) ? lineType : this.type;
  if (dashStyle != undefined) series.dashStyle = dashStyle;
  
  this.dataSeries.push(series);
};

PGMChart.prototype.getChart = function() {
  var series = { renderTo: this.renderTo,
                 marginRight: 25,
				 marginLeft: 25 };
				 
  if (this.type != 'column') series.type = this.type;
  
  return series;
};


PGMChart.prototype.setRenderTo = function(renderTo) {
  this.renderTo = renderTo;
};

PGMChart.prototype.getTitle = function() {
  return { text: this.title, 
		   x: -20 };
};

PGMChart.prototype.getSubTitle = function() {
  return { text: this.subTitle, 
		   x: -20 };
};

PGMChart.prototype.getXAxis = function() {
  return { type: this.xType 
		 };
};

PGMChart.prototype.getYAxis = function() {
  return { title: {
				text: this.yTitle
		   },
		   min: 0,
		   tickPixelInterval: 40,
		   gridLineDashStyle: this.yGridLineStyle,
		   plotLines: [{
				value: 0,
				width: 1,
				color: '#808080'
		   }]
		 };
};

PGMChart.prototype.getTooltip = function() {
  return { formatter: this.tooltip
         };
};

PGMChart.prototype.getLegend = function() {
  return {  enabled: this.showLegend,
			floating: true,
			verticalAlign: 'top',
			itemWidth: 80,
			align: 'right'
         };
};

PGMChart.prototype.getPlotOptions = function() {
  return {	series: {
			  marker: {
			    radius: 1
			  }
			}
		 };
};

PGMChart.prototype.getSeries = function() {
  return this.dataSeries;
};

PGMChart.prototype.computeAverage = function(data) {
  var avg = 0.0;
  if (data == null) return avg;
  
  var sum = 0.0;
  var values = 0;
  
  for (var incr = 0; incr < data.length-1; incr++) {
    sum += data[incr][1];
	values++;
  }
  avg = (values > 0) ? sum / values : 0.0;
  
  return avg;
};

function PGMFormatter() {
  var locDate = new Date(this.x);
  
  return '<strong>' + this.series.name + ' ' + this.y.toFixed(2) +
         '</strong><br/>' + locDate.toLocaleDateString();

};
