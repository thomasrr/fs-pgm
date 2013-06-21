$.ajaxSetup({'async' : false}); $.getScript('PGMChart.js');
$.ajaxSetup({'async' : true});

function DefectChart() {
  PGMChart.call(this);
  
  this.type = 'column';
  this.xType = '';
  this.xTitle = 'Days Old';
  this.yTitle = 'Number of Defects';
  this.tooltip = DefectFormatter;
  this.showLegend = false;
  this.class = 'DefectChart';
  this.renderTo = 'aging';
}

DefectChart.prototype = new PGMChart();
DefectChart.prototype.constructor = DefectChart;


PGMChart.prototype.getXAxis = function() {
  return { title: { text: 'Days Old' } 
		 };
};
			
DefectChart.prototype.displayTotal = function(actual) {
  var total = 0;
  
  for (var incr = 0; incr < actual.length; incr++) total += (actual[incr][1] != null) ? actual[incr][1] : 0;
  
  document.getElementById('defectLegend').innerHTML = 'Defect Aging(' + total + ')';
};

DefectChart.prototype.computeAging = function(defectList) {
  var result = new Array();
  var tmp = new Date();
  var today = convertDate(tmp.toJSON());
  var dates = new Array();

  for (var incr = 0; incr < defectList.total; incr++) {
    if (defectList.Assets[incr].Attributes.CreateDate.value != null) {
      var date = convertDate(defectList.Assets[incr].Attributes.CreateDate.value);
	  dates.push((today-date)/DAY);  // days are in milliseconds
	}
  }
  
  var max = 0;
  for (var incr in dates) {
    if (dates[incr] > max) max = dates[incr];
  }

  var tmpData = new Array();
  for (var incr = 0; incr <= max; incr++) {
    tmpData[incr] = 0;
  }

  for (var incr in dates) {
    tmpData[dates[incr]] += 1;
  }
  
  for (var incr in tmpData) {
    if (tmpData[incr] == 0) {
	  result.push([incr, null]);
	}
	else {
	  result.push([incr, tmpData[incr]]);
	}
  }
 
  return result;
};

function DefectFormatter() {
  return '<strong>' + this.y.toFixed(0) + " defects aged " + this.x.toFixed(0) + " days" + '</strong>';
};