function PGMChart() {
  this.type = '';
  this.title = '';
  this.subTitle = '';
  this.xType = 'datetime';
  this.yTitle = '';
  this.yGridLineStyle = 'Dash';
  this.tooltip = PGMFormatter;
  this.showLegend = true;
  this.dataSeries = new Array();
  this.renderTo = '';
}

PGMChart.prototype.prepare = function() {
}

PGMChart.prototype.display = function() {
  this.prepare();
  
  return new Highcharts.Chart({
		 chart: this.getChart(),
		 title: this.getTitle(),
		 subtitle: this.getSubTitle(),
		 xAxis: this.getXAxis(),
		 yAxis: this.getYAxis(),
		 tooltip: this.getTooltip(),
		 legend: this.getLegend(),
		 plotOptions: this.getPlotOptions(),
		 series: this.getSeries()});
}

PGMChart.prototype.addData = function(name, color, data, style) {
  var series = {};
  
  series.name = name;
  series.color = color;
  series.data = data;
  if (style != undefined) series.style = style;
  
  this.dataSeries.push(series);
}

PGMChart.prototype.getChart = function() {
  return { renderTo: this.renderTo, 
		   type: this.type,
		   marginRight: 25,
		   marginLeft: 25 };
}


PGMChart.prototype.setRenderTo = function(renderTo) {
  this.renderTo = renderTo;
}

PGMChart.prototype.getTitle = function() {
  return { text: this.title, 
		   x: -20 };
}

PGMChart.prototype.getSubTitle = function() {
  return { text: this.subTitle, 
		   x: -20 };
}

PGMChart.prototype.getXAxis = function() {
  return { type: this.xType 
		 };
}

PGMChart.prototype.getYAxis = function() {
  return { title: {
				text: this.yTitle
		   },
		   min: 0,
		   tickPixelInterval: 40,
		   gridLindDashStyle: this.yGridLineStyle,
		   plotLines: [{
				value: 0,
				width: 1,
				color: '#808080'
		   }]
		 };
}

PGMChart.prototype.getTooltip = function() {
  return { formatter: this.tooltip
         };
}

PGMChart.prototype.getlegend = function() {
  return {  enabled: this.showLegend,
			floating: true,
			vericalAlign: 'top',
			itendWidth: 80,
			align: 'right'
         };
}

PGMChart.prototype.getPlotOptions = function() {
  return {	series: {
			  marker: {
			    radius: 1
			  }
			}
		 };
}

PGMChart.prototype.getSeries = function() {
  return this.dataSeries;
}

function PGMFormatter() {
  var locDate = new Date(this.x);
  return '<strong>'+ this.series.name + " " + this.y.toFixed(2) +
         '</strong><br/>'+ locDate.toLocaleDateString();

}
