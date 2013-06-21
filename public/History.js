$.ajaxSetup({'async' : false}); $.getScript('ProcessV1Data.js');
$.ajaxSetup({'async' : false}); $.getScript('ImpactChart.js');
$.ajaxSetup({'async' : false}); $.getScript('ResourceChart.js');
$.ajaxSetup({'async' : true});

function History() {
  ProcessV1Data.call(this);
  
  this.items = ['History'];
  this.increment = 1;
  this.itemPosn = 0;
  this.impact = new ImpactChart();
  this.resource = new ResourceChart();
  this.class = 'History';
};

History.prototype = new ProcessV1Data();
History.prototype.constructor = History;

History.prototype.prepareResults = function(result, date) {  // combine stored data and value 
  this.pushData([date, result]);
  
  this.updateNotify();
};

History.prototype.collectResults = function() {  // combine stored data and value 
  var localData = this.getData();
  var result = new Array();
  var start = new Date(localData[0][0]);
  
  for (var incr = 0; incr < 8; incr++) {  // initialize array structure
    result[incr] = new Array();
  }
  
  var previous = null;
  var previousDate = 0;
  for (var posn = 0; posn < localData.length; posn++) {
	var current = localData[posn][1];
    var bar = computeImpactBar(previous, current, previousDate, start);
	var resource = computeResource(current);

	for (var incr = 0; incr < 5; incr++) {
	  result[incr].push([start.valueOf(), bar[incr]]);
	}
	for (var incr = 5; incr < 8; incr++) {
	  result[incr].push([start.valueOf(), resource[incr-5]]);
	}
	
	previous = current;
	previousDate = start.getDate();
	start = new Date(localData[posn][0]);
  }
  computeIncrImpact(result[0]); 
  this.setResults(result);
  
  this.display();
   
  this.storeResults();
};

History.prototype.display = function() {
  var actual = this.getResults();
  var impact = this.impact;
  var resource = this.resource;
  
  impact.addData('Closed', 'darkblue', actual[0]);
  impact.addData('Removed', 'darkred', actual[1]);
  impact.addData('Added', 'darkgreen', actual[2]);
  impact.addData('WIP', '#CC6600', actual[3]);
  impact.addData('Changed', '#00CC66', actual[4]);
  impact.display();
  
  resource.addData('Development', 'darkblue', actual[5]);
  resource.addData('Maintenance', 'darkred', actual[6]);
  resource.addData('Support', 'darkgreen', actual[7]);
  resource.display();
};

function computeImpactBar(first, second, firstDate, secondDate) {
  var result = new Array();
  var numAdded = 0;
  var numRemoved = 0;
  var numChanged = 0; 
  var numWIP = 0;  
  var tmp = new Array();   //  holds stories already accounted for
	
  for (var incr = 0; incr < 5; incr++) result[incr] = 0;
  
  // compute added and removed stories
  if (first == null) {
    numAdded = second.total;
  }
  else {
    for (var incr = 0; incr < second.total; incr++) {
	  var found = false;
	  for (var kont = 0; kont < first.total; kont++) {
	    if (first.Assets[kont].Attributes.Number.value == second.Assets[incr].Attributes.Number.value) {
		  found = true;
		  break;
		}
	  }
	  if (found == false) {
	    tmp.push(second.Assets[incr].Attributes.Number.value);
		numAdded += 1;
	  }
	}
	for (var incr = 0; incr < first.total; incr++) {
	  var found = false;
	  for (var kont = 0; kont < second.total; kont++) {
	    if (first.Assets[incr].Attributes.Number.value == second.Assets[kont].Attributes.Number.value) {
		  found = true;
		  break;
		}
	  }
	  if (found == false) numRemoved += 1;
	}
  }
  
  // compute closed, WIP, and changed story number
  for (var incr = 0; incr < second.total; incr++) {
    var attrib = second.Assets[incr].Attributes;
    if (attrib.AssetState.value == 128) {
	  result[0] +=1;   // closed item
	}
	else if (attrib.ChangeDate.value != "") {
	  var found = false;
	  for (var kont = 0; kont < tmp.length; kont++) {
	    if (tmp[kont] == attrib.Number.value) {
		  found = true;
		  break;
		}
	  }
	  if (found == false) {
	    tmp.push(attrib.Number.value);
	    var date = createV1Date(attrib.ChangeDate.value);
	    if ((date >= firstDate) && (date <= secondDate)) {
  		  if (attrib['Status.Name'].value != null) numWIP += 1;
		  if (attrib['Description'].value != null) numChanged += 1;
		}
	  }
	}
  }

  result[3] = (first == null) ? 0 : numWIP;
  result[1] = numRemoved;  
  result[2] = numAdded;  
  result[4] = (first == null) ? 0 : numChanged;
  
  return result;
};

function computeResource(current) {
  var result = new Array();
  var numDev = 0;
  var numMain = 0;
  var numOPS = 0;   
	
  for (var incr = 0; incr < 3; incr++) result[incr] = 0;
  
  for (var incr = 0; incr < current.total; incr++) {
    var attrib = current.Assets[incr].Attributes;
    if (attrib.AssetState.value == 128) {  // closed item
	  if (attrib['Category.Name'].value != null) {
	    if (attrib['Category.Name'].value == 'Maintenance')  {
		  numMain++;
		}
		else if ((attrib['Category.Name'].value == 'Ops Support') ||
		        (attrib['Category.Name'].value == 'Customer Support')) {
		  numOPS++;
		}
		else {
		  numDev++;
		}
	  }
	  else {
	    numDev++;
	  }
	}
  }

  result[0] = numDev;  
  result[1] = numMain;  
  result[2] = numOPS;
  
  return result;
};

function computeIncrImpact(data) {  // compute value of accumulated data
  var last = 0;
  for (var incr in data) {   
	var tmp = data[incr][1];
	data[incr][1] -= last;
	last = tmp;
  }
};
