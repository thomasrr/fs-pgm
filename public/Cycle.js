$.ajaxSetup({'async' : false}); $.getScript('ProcessV1Data.js');
$.ajaxSetup({'async' : false}); $.getScript('CycleChart.js');
$.ajaxSetup({'async' : true});

function Cycle() {
  ProcessV1Data.call(this);
  
  this.items = ['CycleStory'];
  this.increment = 1;
  this.itemPosn = 0;
  this.chart = new CycleChart();
  this.class = 'Cycle';
};

Cycle.prototype = new ProcessV1Data();
Cycle.prototype.constructor = Cycle;

Cycle.prototype.prepareResults = function(result, date) {  // combine stored data and value 
  var estimate = result.Assets[result.total-1].Attributes.Estimate.value;
  var previousDate = 0;
  var previousBin = '';
  
  if (estimate == null) estimate = 0.0;
  for (var incr = 0; incr < result.total; incr++) {
//    console.log (JSON.stringify(result.Assets[incr], null, 4));
    var currentDate = convertDate(result.Assets[incr].Attributes.ChangeDate.value);
    if (result.Assets[incr].Attributes["Timebox.Name"].value != null) {
	  if (result.Assets[incr].Attributes["Status.Name"].value != null) {
	    if (previousDate != 0) {
	      this.pushData([previousBin, estimate, ((currentDate - previousDate) / DAY)]);
	    }
		previousBin = result.Assets[incr].Attributes["Status.Name"].value;
	  }
	}
	previousDate = currentDate;
  }
  
  this.updateNotify();
};

Cycle.prototype.collectResults = function() {  // combine stored data and value 
  var localData = this.getData();
  var tmp = new Array();
  var previous = '';
  
  localData.sort(function(a,b){return (a[0] < b[0]) ? -1 : 1});  // based on columns
  for (var incr = 0; incr < localData.length; incr++) {
    if (previous != localData[incr][0]) {
	  if (previous != '') this.pushResults([previous, averageTimes(tmp)]);
	  
	  tmp = new Array();
	  previous = localData[incr][0];
	}

	tmp.push([localData[incr][1], localData[incr][2]]);
  }
  this.display();
   
  this.storeResults();
};

Cycle.prototype.display = function() {
  var actual = this.getResults();
  var chart = this.chart;
  var summary = createCycleSummary(actual);
  
  chart.addData(summary[0], 'darkblue', summary[1]);
  chart.display();
  
  for (var incr = 0; incr < actual.length; incr++) {
    chart.addData(actual[incr][0], 'darkblue', actual[incr][1]);
  }
  chart.displayPage();
};

function createCycleSummary(data) {
  var summary = new Array();
  var hash = createCycleHash(data);
  var result = new Array();
  
  for (var incr = 0; incr < hash.length; incr++) summary[incr] = 0;
  
  for (var incr = 0; incr < data.length; incr++) {
    var localData = data[incr][1];
	for (var posn = 0; posn < localData.length; posn++) {
      summary[computeCycleHash(hash, localData[posn][0])] += localData[posn][1];
	}
  }
  
  for (var incr = 0; incr < hash.length; incr++) result.push([hash[incr], summary[incr]]);
  
  return (['Summary', result]);
};

function createCycleHash(data) {
  var result = new Array();
  
  for (var incr = 0; incr < data.length; incr++) {
    var localData = data[incr][1];
    for (var posn = 0; posn < localData.length; posn++) {
	  var found = false;
	  for (var kont = 0; kont < result.length; kont++) {
	    if (result[kont] == localData[posn][0]) {
	      found = true;
		  break;
	    }
	  }
	  if (!found) result.push(localData[posn][0]);
	}
  }
  result.sort();
  
  return result;
};

function computeCycleHash(data, value) {
  var result = 0;
  for (var incr = 0; incr < data.length; incr++) {
    if (value == data[incr]) {
	  result = incr;
	  break;
	}
  }
  return result;
};

function averageTimes(data) {
  var count = 0;
  var sum = 0.0;
  var previous;
  var result = new Array();
  
  data.sort(function(a,b) {return parseFloat(a[0]) - parseFloat(b[0])}); 
  previous = data[0][0];
  for (var incr = 0; incr < data.length; incr++) {
    if (previous != data[incr][0]) {
	  var ave = (count > 0) ? sum / count : count;
	  result.push([previous, ave]);
	  
	  count = 0;
	  sum = 0.0;
	}

	count++;
	sum += data[incr][1];
	previous = data[incr][0];
  }
  return result;
};
