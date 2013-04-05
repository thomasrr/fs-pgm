var DAY = 86400000;  // milliseconds per day
var WEEK = 7 * DAY;  // milliseconds per week
var WAIT = 200;      // milliseconds to wait before processing
var V1ACTIVE = "\"64\"";
var V1CLOSED = "\"128\"";
var V1BASE = "https://www5.v1host.com/FH-V1/";
var V1REST = V1BASE + "rest-1.v1/"
var V1BASEURL = V1REST + "Data/";
var V1HISTURL = V1REST + "Hist/";
var JIRABASE = "https://almtools.ldschurch.org/fhjira/";
var JIRAREST = JIRABASE + "rest/api/2/"

var AUTOLOAD = false;   // turn off if problem with project

// Handling local storage
function getStoredItem(item) {
  var result = "";
  if (window.localStorage) {
    result = window.localStorage.getItem(item);
  }
  return result; 
}

function setStoredItem(item, value) {
  if (window.localStorage) {
    try {
	  window.localStorage.setItem(item, value);
	}
	catch (error) {
	  console.log (error);
	}
  }
}

function clearStorage() {
  window.localStorage.clear();
}

function storePageValues() {
  setStoredItem ("projectName", document.getElementById("projectName").value);
}

function getStoredBurnDate(projName) {
  return getStoredDate(projName, "burndown");
}

function getStoredVeloDate(projName) {
  return getStoredDate(projName, "velocity");
}

function getStoredCycleDate(projName) {
  return getStoredDate(projName, "cycle");
}

function getStoredDate(projName, type) {
  var result = null;
  var date = getStoredItem(projName + "$" + type);
  if (date != null) result = createDate(date);
  
  return result;
}

function createDate(mSecs) {
  var result = new Date(0);
  result.setTime(mSecs);
  
  return result;
}

function createV1Date(date) {
  var result = (date == 0) ? new Date() : new Date(date);
  result.setHours(23, 59, 59, 0);   // all dates are for 12:59:59.00 PM
  
  return result;
}

function setStoredBurnData(projName, data) {
  setStoredChartData(projName, data, "burndown");
}

function setStoredCycleData(projName, data) {
  setStoredChartData(projName, data, "cycle");
}

function setStoredVeloData(projName, data) {
  var sum = 0;
  var tmp = new Array();
  
  for (var incr in data) {  // copy data so can modify
     tmp.push([data[incr][0], data[incr][1]]);
  }
  
  for (var incr in tmp) {   // accumulate velocity to mimic data from V1
    var last = tmp[incr][1];
    tmp[incr][1] += sum;
	sum += last;
  }
  setStoredChartData(projName, tmp, "velocity");
}

function setStoredChartData(projName, data, type) {
  var index = projName + "$" + type;
  var value = "";
  var last = 0;
  if (data.length == 0) return;
  
  for (var incr = 0; incr < data.length-1; incr++) {  // don't store most recent data point
    value += data[incr].join("#") + "$";
	last = incr;
  }
  
  var date = data[last][0];
  setStoredItem(index, date);  

  index += "$data";
  setStoredItem(index, value);
}

function getStoredBurnData(projName) {
  return getStoredChartData(projName, "burndown");
}

function getStoredVeloData(projName) {
  return getStoredChartData(projName, "velocity");
}

function getStoredCycleData(projName) {
  return getStoredChartData(projName, "cycle");
}

function getStoredChartData(projName, type) {
  var result = new Array();
  var index = projName + "$" + type + "$data";
  
  var list = getStoredItem(index);
  if (list == null) return result;
  
  var tmp = list.split("$");
  for (var incr in tmp) {
    var item = tmp[incr].split("#");
	if (item.length < 2) continue;
	
	result.push([parseInt(item[0]), parseInt(item[1])]);
  }
  return result;
}

// Handlers for tabbed display
var tabList = new Array();
var content = new Array();
function initTabs() {   
  var items = document.getElementById('tabs').childNodes;
  for (var incr = 0; incr < items.length; incr++) {
    if (items[incr].nodeName == "LI") {
	  var elem = getFirstChild(items[incr], 'A');
	  var id = getHash(elem.getAttribute('HREF'));
	  
	  tabList[id] = elem;
	  content[id] = document.getElementById(id);
	}
  }
  var first = true;
  for (var incr in tabList) {
    tabList[incr].onclick = showTab;
	tabList[incr].onfocus = function() { this.blur() };
	if (first == true) {
	  tabList[incr].className = 'selected';
	  content[incr].className = 'tabContent';
    }
    else {
	  tabList[incr].className = '';
      content[incr].className = 'tabContent hide';
	}
	first = false;
  }
}

function showTab() {
  var selected = getHash(this.getAttribute('href'));
  return showTabValue(selected);
}

function showTabValue(selected) {
  for (var incr in tabList) {
    if (incr == selected) {
	  tabList[incr].className = 'selected';
	  content[incr].className = 'tabContent';
	}
	else {
	  tabList[incr].className = '';
	  content[incr].className = 'tabContent hide';
	}
  }
  return false;   // stop the browser following the link
}

function changeTabValue(selected, newValue) {
  for (var incr in tabList) {
    if (incr == selected) {
	  tabList[incr].innerHTML = newValue;
	}
  }
}

function getHash(url) {
  var pos = url.lastIndexOf('#');
  return url.substring(pos+1);
}

function getFirstChild(element, name) {
  for (var incr = 0; incr < element.childNodes.length; incr++) {
    if (element.childNodes[incr].nodeName == name) return element.childNodes[incr];
  }
}

// handling page setup (login, etc)
function loadDashboard() {
  initTabs();
}

// Handlers for Project List
var PROJLIST = new Array();
function buildProjList(list) {
	var item = {};
	var today = new Date();
	var todayStr = today.toJSON().slice(10);
	
    for (var incr = 0; incr < list.total; incr++) { 
	  item = { name: list.Assets[incr].Attributes["SecurityScope.Name"].value,
	           schedule: list.Assets[incr].Attributes["Schedule.Name"].value,
			   begin: list.Assets[incr].Attributes.BeginDate.value,
			   end: list.Assets[incr].Attributes.EndDate.value,
			   id: list.Assets[incr].id.slice(6) };
	  if (item.schedule != null) {
	    if (item.end == null) item.end = todayStr;
	    PROJLIST.push(item);
	  }
	}
	PROJLIST.sort(function(a,b) { return a.name.toLowerCase() < b.name.toLowerCase() ? -1 : 1; });  // sort array on name

	document.getElementById("projectName").innerHTML = buildProjListStr(PROJLIST);
	document.getElementById("projectName").value = getStoredItem("projectName");;
	if ((getProjName() != "") && (AUTOLOAD == true)) loadMetricsPages();   // load the stored data, if appropriate
}

function buildProjListStr(list) {
  	var optList = "<option> </option>";
	
	for (var incr = 0; incr < list.length; incr++) {
	  optList += "<option>" + list[incr].name + "</option>";
	}
	
	return optList;
}

function loadProjList() {
  $.ajax({
    url: getV1URL("ProjList", ""),
    headers: getV1Headers(),
	type: 'GET',
	crossDomain: true,
    dataType: 'jsonp',
    success: function(result) {
//	  console.log(JSON.stringify(result, null, 4));   // Debug json results
	  buildProjList(result);
	},
	error: function(err) {
	  console.log("Error:" + err);
	}
  });
}

function getProjSched() {
  var result = "";
  var projStr = getProjName();
  
  for (var incr in PROJLIST) {
    if (PROJLIST[incr].name == projStr) {
	  result = PROJLIST[incr].schedule;
	  break;
	}
  }
  return result;
}

function getProjID() {
  var result = "";
  var projStr = getProjName();
  
  for (var incr in PROJLIST) {
    if (PROJLIST[incr].name == projStr) {
	  result = PROJLIST[incr].id;
	  break;
	}
  }
  return result;
}

function getProjStartDate() {
  var result = new Date();
  var projStr = getProjName();
  
  for (var incr in PROJLIST) {
    if (PROJLIST[incr].name == projStr) {
	  result = convertDate(PROJLIST[incr].begin);
	  break;
	}
  }
  return result;
}

function getProjEndDate() {
  var result = new Date();
  var projStr = getProjName();
  
  for (var incr in PROJLIST) {
    if (PROJLIST[incr].name == projStr) {
	  result = convertDate(PROJLIST[incr].end);
	  break;
	}
  }
  return result;
}

function getProjLastDate() {   // last date to compute
  var last = getProjEndDate();
  var today = createV1Date(0);

  return (last < today) ? last : today;  // for old projects that are no longer active
}

// Utility methods
var gCALC;
function initCompute() {
  document.getElementById("zoom").innerHTML = "";
  
  updateStatus(false);
  
  gCALC = new calculate();
  gCALC.init();
  
  return gCALC;
}

function dateString(valu) {  // make sure dates all for time 23:59:59.00
  var date = (valu == "") ? new Date() : new Date(valu);
  str = date.toJSON().slice(0,11) + "23:59:59.00"; 
  
  return str;
}

function getV1DateObj(url) {  // expects input like (==url==)&asof="2013-01-31:23:59:59.00"
   var str = url.substr(url.search("asof")+5, 10);
   
   return convertDate(str);
}

function convertDate(str) {  // expects input like 2013-01-31
   var year = str.slice(0,4);
   var month = str.slice(5,7);
   var day = str.slice(8,10);
  
   return Date.UTC(year, (month-1), day);
}

function orderV1Data(data) {
  var orderedBurnData = new Array();

  data.sort(function(a,b) { return a[0] - b[0]; });  // sort array on first value (dates)
  
  var lastDate = 0;
  for (var incr = 0; incr < data.length; incr++) {
    if (data[incr][0] == lastDate) {
	  orderedBurnData[orderedBurnData.length-1][1] += data[incr][1];  // add Story and Defect data
	}
	else {
	  lastDate = data[incr][0];
	  orderedBurnData.push([data[incr][0], data[incr][1]]);
	}
  }
		  
  return orderedBurnData;
}

function getV1Headers() {
  var headers = { Authorization: "Basic " + btoa("rpt:harvest") };
  
  return headers;
}  

function getV1URL(type, projName) {
  var projStr = (projName == "") ? ("\"" + getProjName() + "\""): projName;
  var JSONSTR = "Accept=application/json";
  var PROJSTR = "where=Scope.Name=" + projStr + ";AssetState=" + V1ACTIVE;
  var PROJSTRC = "where=Scope.Name=" + projStr + ";AssetState=" + V1CLOSED;
  var SCHEDSTR = "where=Schedule.Name=\"" + getProjSched() + "\"";
  var DEFSEL = "sel=CreateDate,Owners,Description,Status,Number,Name";
  var CYCSEL = "sel=Timebox,ChangeDate,Estimate,Status&where=Number=";
  var IMPSEL = "sel=ChangeDate,AssetState,Number,Status&where=Scope.Name=" + projStr;
  var STORSEL = "sel=Estimate,Number,Name,Status,Owners,Description,Custom_AcceptanceCriteria";
  
  var url = "";
  
  if (type == "Issues") {
    url = V1BASEURL + "Issue?" + JSONSTR + "&" + PROJSTR;
  }
  else if (type == "Defects") {
    url = V1BASEURL + "Defect?" + JSONSTR + "&" + DEFSEL + "&" + PROJSTR;
  }
  else if (type == "Story") {
    url = V1BASEURL + "Story?" + JSONSTR + "&" + STORSEL + "&" + PROJSTR;
  }
  else if (type == "BurnDefect") {
    url = V1HISTURL + "Defect?" + JSONSTR + "&" +  PROJSTR + "&asof=";
  }
  else if (type == "BurnStory") {
    url = V1HISTURL + "Story?" + JSONSTR + "&" +  PROJSTR + "&asof=";
  }
  else if (type == "VeloDefect") {
        url = V1HISTURL + "Defect?" + JSONSTR + "&" +  PROJSTRC + "&asof=";
  }
  else if (type == "VeloStory") {
        url = V1HISTURL + "Story?" + JSONSTR + "&" +  PROJSTRC + "&asof=";
  }
  else if (type == "ProjList") {
        url = V1BASEURL + "Scope?" + JSONSTR + "&" + "where=AssetState=" + V1ACTIVE;
  }
  else if (type == "CycleList") {
        url = V1HISTURL + "Story?" + JSONSTR + "&" +  PROJSTRC + "&asof=";
  }
  else if (type == "CycleStory") {
        url = V1HISTURL + "Story?" + JSONSTR + "&" + CYCSEL;
  }
  else if (type == "Impact") {
        url = V1HISTURL + "Story?" + JSONSTR + "&" +  IMPSEL + "&asof=";
  }
  
  return url;
}

function getV1Link(oid, text) {
  var link = "<a href=" + V1BASE;
  
  if (oid.charAt(0) == 'I') {
    link += "Issue";
  }
  else if (oid.charAt(0) == 'D') {
    link += "Defect";
  }
  else if (oid.charAt(0) == 'S') {
    link += "Story";
  }
  link += ".mvc/Summary?oidToken=" + oid + ">" + text + "</a>";
  
  return link;
}

function getJiraHeaders() {
  var headers = { Authorization: "Basic " + btoa("bireports:harvest") };
  
  return headers;
}

// create burndown chart
function loadBurnData(localData, compute) {
  var value = compute.getValue('burndown');
  if (value > 0) {
    document.getElementById("burndown").innerHTML = "Processing " + value + ".....";
	setTimeout( function(){loadBurnData(localData, compute)}, WAIT);
  }
  else if (value == 0) {
    loadBurnChart(localData, compute);
  }
}

function loadBurnChart(localData, compute) {
  if (compute.isReady == false) {   // make sure that velocity computing is done before proceeding
    document.getElementById('burndown').innerHTML = "Waiting for velocity processing (" + compute.getValue('velocity') + ").....";
	setTimeout( function(){loadBurnChart(localData, compute)}, WAIT);
  }
  else {
    document.getElementById('burndown').innerHTML = "Loading Burndown Chart.....";
    var projName = getProjName();
    var stored = getStoredBurnData(projName);
	for (var incr in stored) {
      localData.push([stored[incr][0], stored[incr][1]]);
    }
	compute.setData('burndown', orderV1Data(localData));
	buildBurnChart(compute.getData('burndown'), compute.getData('velocity'), 'burndown');
	setStoredBurnData(projName, compute.getData('burndown'));
	updateStatus(true);
  }
}

function getV1Data(items, increment, compute, type, firstDate) { 
  var today = getProjLastDate(); 
  var localData = new Array();
  
  for (var kont = 0; kont < items.length; kont++) {
    var start = new Date((firstDate != null) ? firstDate : getProjStartDate());
	if (firstDate != null) start.setDate(start.getDate() + increment);   // compute next date after last stored
    var base = getV1URL(items[kont], "");
    while (createV1Date(start) <= today) {
      computeV1Data(base, compute, type, localData, start);
      start.setDate(start.getDate() + increment);
    }
	var diff = createV1Date(start) - today;
	if (diff < (increment * DAY)) computeV1Data(base, compute, type, localData, start);  // catch partial increments
  } // iterate over items
  
  return localData;
}

function computeV1Data(V1Base, compute, type, localData, start) {
  var url = V1Base + dateString(start);
  compute.incrementValue(type);  // increment process counter

  $.ajax({
    url: url,
    headers: getV1Headers(),
	type: 'GET',
	crossDomain: true,
    dataType: 'jsonp',
    success: function(result) {
	  var day = getV1DateObj(this.url);
	  var sum = 0;
	  compute.decrementValue(type);   // decriment process counter
		  
	  if (result.Assets.length > 0) {
		for (var incr = 0; incr < result.Assets.length; incr++) {
		  sum += result.Assets[incr].Attributes.Estimate.value;
		}
		localData.push([day, sum]);
//	    console.log(JSON.stringify(result, null, 4));   // Debug json results
	  }
	},
	error: function(err) {
	  compute.decrementValue(type);   // decriment process counter
	  console.log("Error: " + err);
	}
  });
}

function collectV1Data(localData) {
  var result = new Array();
  var total = new Array();
  var tmp = new Array();
  var max = 0;
  
  for (var incr in localData) {   // find maximum estimate
    if (localData[incr][1] > max) max = localData[incr][1];
  }
  for (var incr = 0; incr < max+1; incr++) {  // initialize arrays
    total[incr] = 0;
	tmp[incr] = 0;
  }
  
  for (var incr in localData) {   // accumulate values in buckets
    tmp[localData[incr][1]] += localData[incr][0];
	total[localData[incr][1]] += 1;
  }
  
  result.push([0, null]);
  var last = 0;
  for (var incr in tmp) {   // compute AVG in each bucket 
    if (total[incr] > 0) {
	  result.push([parseInt(incr), tmp[incr]/total[incr]]);
	  last = incr;
	}
//	console.log ("Est: " + incr + "  Time: " + tmp[incr]/total[incr]);
  }
  last++;
  result.push([parseInt(last), null]);
  
  return result;
}

function initLoadBurndown(projName, compute) {
  var items = ["BurnStory", "BurnDefect"];
  
  var data = getV1Data(items, 1, compute, 'burndown', getStoredBurnDate(projName));

  setTimeout( function(){loadBurnData(data, compute)}, WAIT);
} 

// create velocity chart
function loadVeloData(localData, compute) {
  var value = compute.getValue('velocity');
  if (value > 0) {
    document.getElementById('velocity').innerHTML = "Processing " + value + ".....";
	setTimeout( function(){loadVeloData(localData, compute)}, WAIT);
  }
  else if (value == 0)  {
    document.getElementById('velocity').innerHTML = "Loading Velocity Chart.....";
    var projName = getProjName();
    var stored = getStoredVeloData(projName);
	for (var incr in stored) {
      localData.push([stored[incr][0], stored[incr][1]]);
    }
    var tmpData = orderV1Data(localData);
	computeIncrVelo(tmpData);
	
	compute.setData('velocity', tmpData);
	buildVelocityChart(compute.getData('velocity'), null, 'velocity');
	setStoredVeloData(projName, compute.getData('velocity'));
  }
}

function computeIncrVelo(data) {
  var last = 0;
  for (var incr = 0; incr < data.length; incr++) {   // compute velocity of accumulated data
	var tmp = data[incr][1];
	data[incr][1] -= last;
	last = tmp;
  }
}

// create defect aging chart

// create cycle time charts
function loadCycleData(localData, compute) {
  var value = compute.getValue('cycles');
  if (value > 0) {
    document.getElementById("cycle").innerHTML = "Loading Cycle Time Chart.....";
	setTimeout( function(){loadCycleData(localData, compute)}, WAIT);
  }
  else if (value == 0) {
    getV1StoryList(compute, 'cycles', localData);
  }
}

function loadCycleStory(localData, compute) {
  var value = compute.getValue('cycles');
  if (value > 0) {
    document.getElementById("cycle").innerHTML = "Processing " + value + ".....";
	document.getElementById("cycleTime").innerHTML = "Building Cycle Time Charts.....";
	setTimeout( function(){loadCycleStory(localData, compute)}, WAIT);
  }
  else if (value == 0) {
    document.getElementById("cycle").innerHTML = "Building Cycle Time Chart.....";
	document.getElementById("cycleTime").innerHTML = "Building Cycle Time Charts.....";

	var ordered = collectV1Data(localData);
	buildCycleChart(ordered, 'cycle');

    buildCyclePage(ordered, compute.getData('cycles'));
	
	buildResource(compute.getData('cycles'));
  }
}

function buildCyclePage(sum, data) {
  var headers = new Array();
  var plots = new Array();
  
  headers.push("Summary");
  collectCylceBreakdown(data, headers, plots);
  createCyclePage(headers);
  
  buildCycleChart(sum, cycleID(headers[0]));
  for (var incr = 1; incr < plots.length; incr++) {
    var ordered = collectV1Data(plots[incr]);
	buildCycleChart(ordered, cycleID(headers[incr]));
  }
}

function cycleID(label) {
  var result = "";
  
  result = label.replace(/ /g, "_");
  result = result.replace(/-/g,"_");
  result = result.replace(/\//g,"_");
  result += "_";
  return result;
}

function formatChart(label) {
  var chartStr = "";

  chartStr += "<td><fieldset class=\"smallChart\">";
  chartStr += "<legend>" + label + "</legend>";
  chartStr += "<div id=\"" + cycleID(label) + "\" class=\"smallChart\"></div>";
  chartStr += "</fieldset></td>";

  return chartStr;
}

function collectCylceBreakdown(data, headers, plots) {
  for (var incr in data) {
    var found = false;
    for (var kont in headers) {
	  if (headers[kont] == data[incr][0]) {
	    found = true;
		break;
	  }
	}
	if ((data[incr][0] != "") && (found == false)) headers.push(data[incr][0]);
  }
  
  for (var incr in headers) {
    plots[incr] = new Array();
  }
  
  for (var incr in data) {
    var posn = -1;
	for (var kont in headers) {
	  if (headers[kont] == data[incr][0]) {
	    posn = kont; 
		break;
	  }
	}
	if (posn > -1) plots[posn].push([data[incr][2], data[incr][1]]);
  }
}

function createCyclePage(headers) {
  var pageStr = "<table>";
  
  for (var incr in headers) {
    pageStr += ((incr % 3) == 0) ? "<tr>" : "";
    pageStr += formatChart(headers[incr]);
	pageStr += ((incr % 3) == 2) ? "</tr>" : "";
  }
  pageStr += "</table>";
  
  document.getElementById("cycleTime").innerHTML = pageStr;
}

function computeV1Cycle(V1Base, compute, localData, start) {
  var url = V1Base + dateString(start);
  compute.incrementValue('cycles');  // increment process counter

  $.ajax({
    url: url,
    headers: getV1Headers(),
	type: 'GET',
	crossDomain: true,
    dataType: 'jsonp',
    success: function(result) {
	  compute.decrementValue('cycles');   // decriment process counter	  
	  if (start == "") {
	    localData.today = result;
	  }
	  else {
	    localData.previous = result;
	  }
//	  console.log(JSON.stringify(result, null, 4));   // Debug json results
	},
	error: function(err) {
	  compute.decrementValue('cycles');   // decriment process counter
	  console.log("Error: " + err);
	}
  });
}

function computeV1CycleStory(V1Base, compute, localData) {
  compute.incrementValue('cycles');  // increment process counter

  $.ajax({
    url: V1Base,
    headers: getV1Headers(),
	type: 'GET',
	crossDomain: true,
    dataType: 'jsonp',
    success: function(result) {
	  var time = computeV1StoryTimeSum(result);
	  var estimate  = result.Assets[result.total-1].Attributes.Estimate.value; 
	  localData.push([time, estimate]);
//	  console.log(JSON.stringify(result, null, 4));   // Debug json results
      computeV1StoryTime(result, compute);
	  compute.decrementValue('cycles');   // decriment process counter
	},
	error: function(err) {
	  compute.decrementValue('cycles');  // decriment process counter
	  console.log("Error: " + err);
	}
  });
}

function computeV1StoryTimeSum(data) {
  var time = 0;
  var previousDate = 0;
  
  for (var incr = 0; incr < data.total; incr++) {
///    console.log (JSON.stringify(data.Assets[incr], null, 4));
    var currentDate = convertDate(data.Assets[incr].Attributes.ChangeDate.value);
    if (data.Assets[incr].Attributes["Timebox.Name"].value != null) {
	  if ((data.Assets[incr].Attributes["Status.Name"].value != null) &&
	      (data.Assets[incr].Attributes["Status.Name"].value != "")) {
	    if (previousDate != 0) {
	      time += currentDate - previousDate;
	    }
	  }
	}
	previousDate = currentDate;
  }
  
  return (time / DAY);
}

function computeV1StoryTime(data, compute) {
  var previousDate = 0;
  var previousBin = "";
  var estimate = (data.total > 0) ? data.Assets[data.total-1].Attributes.Estimate.value : 0;
  
  for (var incr = 0; incr < data.total; incr++) {
///    console.log (JSON.stringify(data.Assets[incr], null, 4));
    var currentDate = convertDate(data.Assets[incr].Attributes.ChangeDate.value);
    if (data.Assets[incr].Attributes["Timebox.Name"].value != null) {
	  if (data.Assets[incr].Attributes["Status.Name"].value != null) {
	    if (previousDate != 0) {
	      compute.pushCycles([previousBin, estimate, ((currentDate - previousDate) / DAY)]);
	    }
		previousBin = data.Assets[incr].Attributes["Status.Name"].value;
	  }
	}
	previousDate = currentDate;
  }
}

function getV1StoryList(compute, type, inputData) {
  var items = ["CycleStory"];
  var localData = new Array();
  
  for (var kont = 0; kont < items.length; kont++) {
    var base = getV1URL(items[kont], "");
	
	var storyList = computeStoryList(inputData);
	for (var incr in storyList) {
	  var story = base + "\"" + storyList[incr] + "\"";  // name/number of story
      computeV1CycleStory(story, compute, localData);
	}
  }
  
  setTimeout( function(){loadCycleStory(localData, compute)}, WAIT);
}

function computeStoryList(data) {
  var result = new Array();
  
  for (var incr = 0; incr < data.today.total; incr++) {
    var found = false;
	for (var kont = 0; kont < data.previous.total; kont++) {
	  if (data.previous.Assets[kont].Attributes.Number.value == data.today.Assets[incr].Attributes.Number.value) {
	    found = true;
		break;
	  }
	}
	if (found == false) result.push(data.today.Assets[incr].Attributes.Number.value);
  }
  
  return result;
}

function initLoadCycleData(projName, compute) {
  var items = ["CycleList"];
  
  var data = getV1Cycle(items, 28, compute);

  setTimeout( function(){loadCycleData(data, compute)}, WAIT);
} 

function getV1Cycle(items, increment, compute) { 
  var today = new Date(getProjLastDate()); 
  var localData = { previous: new Array(), today: new Array() };
  
  for (var kont = 0; kont < items.length; kont++) {
	start = today.setDate(today.getDate() - increment);

    var base = getV1URL(items[kont], "");
    computeV1Cycle(base, compute, localData, start);
    computeV1Cycle(base, compute, localData, "");
  } // iterate over items
  
  return localData;
}

// create story impact chart
function initLoadImpact(projName, compute) {
  var items = ["Impact"];
  var increment = 7 * compute.getIncrement();
  var start = getProjStartDate();
  
  getV1Impact(items, projName, increment, compute, start);

  setTimeout(function(){loadImpactData(increment, start, compute)}, WAIT);
}

function loadImpactData(increment, start, compute) {
  var value = compute.getValue('impact');
  if (value > 0) {
    document.getElementById("impact").innerHTML = "Processing " + value + ".....";
	setTimeout( function(){loadImpactData(increment, start, compute)}, WAIT);
  }
  else if (value == 0) {
    buildImpact(increment, start, compute);
  }
}

function getV1Impact(items, projName, increment, compute, startDate) { 
  var today = new Date(); 
  
  for (var kont = 0; kont < items.length; kont++) {
	var start = new Date(startDate);
    var base = getV1URL(items[kont], projName);
	var posn = 0;
	while (start <= today) {
       computeV1StoryImpact(base, compute, start, posn);
	   start.setDate(start.getDate() + increment);
	   posn++;
	}
	if (start != today) computeV1StoryImpact(base, compute, today, posn);
  } // iterate over items
}

function computeV1StoryImpact(V1Base, compute, start, posn) {
  var url = V1Base + dateString(start);
  compute.incrementValue('impact');  // increment process counter

  $.ajax({
    url: url,
    headers: getV1Headers(),
	type: 'GET',
	crossDomain: true,
    dataType: 'jsonp',
    success: function(result) {
	  compute.decrementValue('impact');   // decriment process counter	  
	  compute.pushImpact(posn, result); 

	 // console.log(JSON.stringify(result, null, 4));   // Debug json results
	},
	error: function(err) {
	  compute.decrementValue('impact');   // decriment process counter
	  console.log("Error: " + err);
	}
  });
}

function computeIncrImpact(data) {
  var last = 0;
  for (var incr in data) {   // compute value of accumulated data
	var tmp = data[incr][1];
	data[incr][1] -= last;
	last = tmp;
  }
}

function maxIncr(start, finish, increment) {
  var result = 0;
  while (start <= finish) {
    start.setDate(start.getDate() + increment);
	result++;
  }
  if (start != finish) result++;
  
  return result;
}

function buildImpact(increment, startDate, compute) {
  var result = new Array();
  var today = new Date();
  var unique = new Array();
  var start = new Date(startDate);
  
  for (var incr = 0; incr < 5; incr++) {  // initialize array structure
    result[incr] = new Array();
  }
  
  var max = maxIncr(new Date(startDate), new Date(), increment);
  var previous = null;
  var previousDate = 0;
  var localData = compute.getData('impact');
  for (var posn = 0; posn < max; posn++) {
	var current = localData[posn];
    var tmp = computeImpactBar(previous, current, previousDate, start);

	for (var incr = 0; incr < 5; incr++) {
	  result[incr].push([start.valueOf(), tmp[incr]]);
	}
	
	previous = current;
	previousDate = start.getDate();
	start.setDate(start.getDate() + increment);
  }
  computeIncrImpact(result[0]);
  compute.setData('impact', result);
  
  buildImpactChart(compute.getData('impact'), null, 'impact');
}

function computeImpactBar(first, second, firstDate, secondDate) {
  var result = new Array();
  var numAdded = 0;
  var numRemoved = 0;
  var numChanged = 0;  
  var tmp = new Array();   //  holds stories already accounted for
	
  for (var incr = 0; incr < 5; incr++) result[incr] = 0;
  
  // compute added and removed stories
  if (first == null) {
    numAdded = second[0].total;
  }
  else {
    for (var incr = 0; incr < second[0].total; incr++) {
	  var found = false;
	  for (var kont = 0; kont < first[0].total; kont++) {
	    if (first[0].Assets[kont].Attributes.Number.value == second[0].Assets[incr].Attributes.Number.value) {
		  found = true;
		  break;
		}
	  }
	  if (found == false) {
	    tmp.push(second[0].Assets[incr].Attributes.Number.value);
		numAdded += 1;
	  }
	}
	for (var incr = 0; incr < first[0].total; incr++) {
	  var found = false;
	  for (var kont = 0; kont < second[0].total; kont++) {
	    if (first[0].Assets[incr].Attributes.Number.value == second[0].Assets[kont].Attributes.Number.value) {
		  found = true;
		  break;
		}
	  }
	  if (found == false) numRemoved += 1;
	}
  }
  
  // compute closed and changed story number

  for (var incr = 0; incr < second[0].total; incr++) {
    var attrib = second[0].Assets[incr].Attributes;
    if (attrib.AssetState.value == 128) {
	  result[0] +=1;
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
	    if ((date >= firstDate) && (date <= secondDate) && (attrib["Status.Name"].value != null)) numChanged += 1;
	  }
	}
  }
  
  result[3] = (first == null) ? 0 : numChanged;
  result[1] = numRemoved;  
  result[2] = numAdded;  
  result[4] = tmp.length;
  
  return result;
}

function buildImpactChart(actual, dumby, renderTo) {
  if (actual.length < 4) return;
  var showLegend = (renderTo != 'impact');
  
  var chart = new Highcharts.Chart({
            chart: {
                renderTo: renderTo,
                marginRight: 25,
                marginBottom: 25,
				type: 'column'
            },
            title: {
                text: 'Story Impact',
                x: -20 //center
            },
            subtitle: {
                text: getProjName(),
                x: -20
            },
			plotOptions: {
			    column: {
			        stacking: 'normal'
			    }
			},
            xAxis: {
                type: 'datetime'
            },
            yAxis: {
                title: {
                    text: 'Stories Changed'
                },
				min: 0,
				tickPixelInterval : 40,
				gridLineDashStyle: 'Dash',
                plotLines: [{
                    value: 0,
                    width: 1,
                    color: '#808080'
                }]
            },
            tooltip: {
                formatter: function() {
							   var locDate = new Date(this.x);
							 
						       return '<strong>'+ locDate.toLocaleDateString() + '</strong><br/>' + 
							          this.series.name +': ' + this.y + 
							          '<br/>Total: ' + this.point.stackTotal;
							 }
            },
            legend: {
				enabled: showLegend,
				floating: true,
				verticalAlign: 'top',
				itemWidth: 80,
				align: 'right'
            },
            series: [{
                name: 'Closed',
				color: 'darkblue',
                data: actual[0]
            },{
                name: 'Removed',
				color: 'darkred',
                data: actual[1]
            },{
                name: 'Added',
				color: 'darkgreen',
                data: actual[2]
            },{
                name: 'WIP',
				color: '#CC6600',
                data: actual[3]
            }]
        });
  return chart;
}

// create resource usage chart
function buildResource(data) {
  var result = new Array();
  
  for (var incr = 0; incr < 4; incr++) {  // initialize array structure
    result[incr] = new Array();
  }
//  computeV1StoryImpact(data);
  
 // result[0] = [[Date.UTC(2013, 1, 4), 14], [Date.UTC(2013, 1, 11), 12], [Date.UTC(2013, 1, 18), 13]];
 // result[1] = [[Date.UTC(2013, 1, 4), 1], [Date.UTC(2013, 1, 11), 3], [Date.UTC(2013, 1, 18), 5]];
 // result[2] = [[Date.UTC(2013, 1, 4), 2], [Date.UTC(2013, 1, 11), 1], [Date.UTC(2013, 1, 18), 0]];

  buildResourceChart(result);
}

// load list data (Issues, Story, Defect)

function initLoadVeloData(projName, compute) {
  var items = ["VeloStory", "VeloDefect"];
  
  var data = getV1Data(items, (7 * compute.getIncrement()), compute, 'velocity', getStoredVeloDate(projName));   // collect values over one week
  
  setTimeout( function(){loadVeloData(data, compute)}, WAIT);
}

function getProjName() {
  var projName = document.projectData.projectName.value;
  
  return projName;
}

function formatIssues(issueList, full) {
  var formatted = "<ul>";
  var max = issueList.total;
  
  if (max == 0) {
    formatted = "No Issues at this time!";
  }
  for (var incr = 0; incr < max; incr++) {
    if (issueList.Assets[incr].Attributes["ResolutionReason.Name"].value != "Resolved") {
      formatted += "<li>";
	  formatted += getV1Link (issueList.Assets[incr].id, issueList.Assets[incr].Attributes.Number.value); 
	  formatted += "  " + issueList.Assets[incr].Attributes.Name.value;
	  if (full == true) {
	    formatted += "<ul>{";
		if (issueList.Assets[incr].Attributes.TargetDate.value != null) {
	      formatted += issueList.Assets[incr].Attributes.TargetDate.value;
	    }
	    formatted += "} ";
		formatted += "[";  
	    if (issueList.Assets[incr].Attributes["Owner.Name"].value != null) {
	      formatted += issueList.Assets[incr].Attributes["Owner.Name"].value;
        }
        formatted += "]";
        formatted += "(" + issueList.Assets[incr].Attributes["Category.Name"].value;
        formatted += ")</ul>";
	    
        if (issueList.Assets[incr].Attributes.Description.value != null) {
	      var str = issueList.Assets[incr].Attributes.Description.value;
	      str = str.replace (/<[^>]*>?/gm, '');  // strip HTML
	      formatted += "<ul>" + str + "</ul>";
	    }
	  }
	  formatted += "</li>";
    }
  }
  
  return formatted;
}

function formatDefects(defectList, full) {
  var formatted = "";
  var max = defectList.total;
  
  if (max == 0) {
    formatted = "No V1 defects at this time!";
  }
  else {
    formatted = "There are " + max + " defects";
  }
  formatted += "<ul>";
  for (var incr = 0; incr < max; incr++) {
    formatted += "<li>";

    formatted += getV1Link (defectList.Assets[incr].id, defectList.Assets[incr].Attributes.Number.value) + " "; 
    formatted += defectList.Assets[incr].Attributes.Name.value;
	if (full == true) {
	  formatted += "<ul>";
	  if (defectList.Assets[incr].Attributes["Status.Name"].value != null) {
	    formatted += defectList.Assets[incr].Attributes["Status.Name"].value;
	  }
	  else {
	    formatted += "Not yet started";
	  }
	  if (defectList.Assets[incr].Attributes["Owners.Name"].value != null) {
	    formatted += " [" + defectList.Assets[incr].Attributes["Owners.Name"].value + "]";;
	  }
	  formatted += "</ul>";
      if (defectList.Assets[incr].Attributes.Description.value != null) {
	    var str = defectList.Assets[incr].Attributes.Description.value;
	    str = str.replace (/<[^>]*>?/gm, '');  // strip HTML
	    formatted += "<ul>" + str + "</ul>";
	  }
	}
	formatted += "</li>";
  }
  
  return formatted;
}

function formatStory(storyList, full) {
  var formatted = "";
  var max = storyList.total;
  
  if (max == 0) {
    formatted = "No V1 Stories at this time!";
  }
  else {
    var points = 0;
	for (var incr = 0; incr < max; incr++) {
	  // console.log(JSON.stringify(storyList.Assets[incr], null, 4));
	  if (storyList.Assets[incr].Attributes.Estimate.value != null)
        points += parseInt(storyList.Assets[incr].Attributes.Estimate.value);
	}
    formatted = "There are " + max + " stories representing " + points + " story points";
	if (full == true) formatted += formatAcceptance(storyList,  max);
  }
  formatted += "<ul>";
  for (var incr = 0; incr < max; incr++) {
    formatted += "<li>";

    formatted += getV1Link (storyList.Assets[incr].id, storyList.Assets[incr].Attributes.Number.value) + " "; 
    formatted += "(";
    if (storyList.Assets[incr].Attributes.Estimate.value != null)
      formatted	+= storyList.Assets[incr].Attributes.Estimate.value;
    formatted += ") ";
	formatted += "[";
    if (storyList.Assets[incr].Attributes.Status.value == null) {
	  formatted += "Not yet started";
	}
	else {
	  formatted += storyList.Assets[incr].Attributes["Status.Name"].value;
	}
	if (storyList.Assets[incr].Attributes["Owners.Name"].value != null) {
	    formatted += ";" + storyList.Assets[incr].Attributes["Owners.Name"].value;
	}
	formatted += "] ";
	formatted += storyList.Assets[incr].Attributes.Name.value;
	if (full == true) {
      if (storyList.Assets[incr].Attributes.Description.value != null) {
	    var str = storyList.Assets[incr].Attributes.Description.value;
	    str = str.replace (/<[^>]*>?/gm, '');  // strip HTML
	    formatted += "<ul>" + str + "</ul>";
	  }
	}
	formatted += "</li>";
  }
  
  return formatted;
}

function formatAcceptance (storyList, max) {
  var percent;
  var count = 0;
  var result = "";
  var first = "<li>";
  
  for (var incr = 0; incr < max; incr++) {
	if (storyList.Assets[incr].Attributes.Custom_AcceptanceCriteria.value != null) count += 1;
  }
  percent = 100 - ((count / max) * 100);
  if (percent > 25.00) {
    var color = "FFFF66";
    if (percent > 75.00) {
	  color = "#CC3300";
	}
	else if (percent > 50.00) {
	  color = "#FFCC33";
	}
    first = '<li style="width:310px;background-color:' + color + '">';
  }
  
  result = first + percent.toFixed(2) + "% stories missing Acceptance Criteria</li>";
  return result;
}

function updateIssues(compute) {
  document.getElementById("issueData").innerHTML = "No Issues, yet!";
  $.ajax({
    url: getV1URL("Issues", ""),
    headers: getV1Headers(),
	type: 'GET',
	crossDomain: true,
    dataType: 'jsonp',
    success: function(result) {
//	  console.log(JSON.stringify(result, null, 4));   // Debug json results
	  document.getElementById("issueData").innerHTML = formatIssues(result, false);
	  compute.setData('issues', result);
	},
	error: function(err) {
	  console.log("Error:" + err);
	}
  });
}

function updateBug(compute) {
  document.getElementById("bugData").innerHTML = "No bug data, yet!";
  $.ajax({
    url: getV1URL("Defects", ""),
    headers: getV1Headers(),
	type: 'GET',
	crossDomain: true,
    dataType: 'jsonp',
    success: function(result) {
//	  console.log(JSON.stringify(result, null, 4));   // Debug json results
	  document.getElementById("bugData").innerHTML = formatDefects(result, true);
	  compute.setData('defect', result);
	  buildDefectChart(computeAging(result));
	},
	error: function(err) {
	  console.log("Error:" + err);
	}
  });
}

function updateStory(compute) {
  document.getElementById("storyData").innerHTML = "Waiting for Story data!";
  $.ajax({
    url: getV1URL("Story", ""),
    headers: getV1Headers(),
	type: 'GET',
	crossDomain: true,
    dataType: 'jsonp',
    success: function(result) {
//	  console.log(JSON.stringify(result, null, 4));   // Debug json results
	  document.getElementById("storyData").innerHTML = formatStory(result, true);
	  compute.setData('story', result);
	},
	error: function(err) {
	  console.log("Error:" + err);
	}
  });
}

function computeStatus() {
  var result = { value: "#66CC00", text: "On Target" };
  var projDate = gCALC.getProjDate();
  var endDate = gCALC.getEndDate();
  
  if (projDate > endDate) {
    result.value = "#D80000";
	result.text = "<strong>Project in trouble</strong></br>Forecast end date is greater than Project target date";
  }
  else {
    var testDate = projDate + (2 * WEEK);
    if (testDate >= endDate) {
	  result.value = "#FFCC33";
	  result.text = "Project at risk</br>Forecast end date is within two weeks of Project target date";
	}
  }
  // number of bugs > threshold (result = "yellow")
  // target date for Issues > endDate (result = "yellow")
  
  return result; 
}

function computeProjected (actual, velocity) {
  var computed = new Array();  
  if ((actual.length == 0) || (velocity == 0)) return computed;

  var nextDay = actual[actual.length - 1][0];
  var nextValu = actual[actual.length - 1][1];
  var increment = WEEK * gCALC.getIncrement();
  computed.push([nextDay, nextValu]);
  
  while (nextValu > 0.0) {
  	nextValu -= velocity;
	if (nextValu < 0.0) {
	  nextDay += parseInt(increment * ((velocity + nextValu) / velocity));
	  nextValu = 0.0;
	}
	else {
	  nextDay += increment;
	}
  }
  computed.push([nextDay, nextValu]);	
				
  return computed;
}

function computeIdealLine (line, project) {
  var result = new Array();
  var maxVal = 0;
  
  for (var incr = 0; incr < line.length; incr++) {   // compute max value
    if (line[incr][1] > maxVal) maxVal = line[incr][1];
  }
  
  result.push ([line[0][0], maxVal]);
  result.push ([getProjEndDate(), 0]);
  
  return result;
}

function computeAvgVelocity(velocity) {
  var sum = 0.0;
  var values = 0;
  var avg = 0.0;
  var avgSize = gCALC.getAvgSize();
  
  if (avgSize > 0) {  
    if (velocity.length > 0) {
      for (var incr = avgSize; incr > 0; incr--) {
	    sum += velocity[velocity.length-incr][1];
	    values++;
	  }
	}
  }
  else {  // if avgSize < 1; compute average of whole array
    for (var incr in velocity) {
      sum += velocity[incr][1];
	  values++;
    }
  }
  
  if (values > 0) avg = sum / values;
  
  return avg;
}

function computeAging(defectList) {
  var result = new Array();
  var tmp = new Date();
  var today = convertDate(tmp.toJSON());
  var dates = new Array();

  for (var incr = 0; incr < defectList.total; incr++) {
//    console.log(JSON.stringify(defectList.Assets[incr], null, 4));
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
}

function buildBurnChart(burnDown, velocity, renderTo) {
  var projected = computeProjected (burnDown, computeAvgVelocity(velocity));
  var V1Line = computeIdealLine (burnDown, projected);
  
  gCALC.setEndDate(V1Line[V1Line.length-1][0]);
  if (projected.length > 0) gCALC.setProjDate(projected[projected.length-1][0]);
  var showLegend = true;
  
//  var ticks = new Array();
//  for (var incr = 0; incr < burnDown.length; incr+=7) ticks.push(burnDown[incr][0]);
  
  var chart = new Highcharts.Chart({
            chart: {
                renderTo: renderTo,
                type: 'line',
                marginRight: 25,
                marginBottom: 25
            },
            title: {
                text: 'Project Burndown',
                x: -20 //center
            },
            subtitle: {
                text: getProjName(),
                x: -20
            },
            xAxis: {
                type: 'datetime',
//				tickPositions: ticks
			},
            yAxis: {
                title: {
                    text: 'Total Story Estimate'
                },
				min: 0,
				tickPixelInterval : 40,
				gridLineDashStyle: 'Dash',
                plotLines: [{
                    value: 0,
                    width: 1,
                    color: '#808080'
                }]
            },
            tooltip: {
                formatter: function() {
				           var locDate = new Date(this.x);
						   return '<strong>'+ this.series.name + " " + this.y.toFixed(2) +'</strong><br/>'+ locDate.toLocaleDateString();
                }
            },
            legend: {
				enabled: showLegend,
				floating: true,
				verticalAlign: 'top',
				itemWidth: 80,
				align: 'right'
			},
			plotOptions: {
			  series: {
			    marker: {  
				   radius: 1
				}
			  }
			},
			series: [{
				name: 'actual',
				color: 'darkred',
                data: burnDown
            },{
				name: 'ideal',
				color: '#669933',
                data: V1Line,
				dashStyle: 'Dot'
            },{
                name: 'forecast',
				color: 'darkblue',
				data: projected,
				dashStyle: 'Dash'
			}]
        });
  
  return chart;
}

function buildVelocityChart(actual, dumby, renderTo) {
  if (actual.length == 0) return;
  
  var average = computeAvgVelocity(actual);
  var showLegend = (renderTo != 'velocity');
  
  var chart = new Highcharts.Chart({
            chart: {
                renderTo: renderTo,
                marginRight: 25,
                marginBottom: 25
            },
            title: {
                text: 'Team Velocity',
                x: -20 //center
            },
            subtitle: {
                text: getProjName(),
                x: -20
            },
			plotOptions: {
			  series: {
			    marker: {  
				   radius: 1
				}
			  }
			},
            xAxis: {
                type: 'datetime'
            },
            yAxis: {
                title: {
                    text: 'velocity / week'
                },
				min: 0,
				tickPixelInterval : 40,
				gridLineDashStyle: 'Dash',
                plotLines: [{
                    value: 0,
                    width: 1,
                    color: '#808080'
                }]
            },
            tooltip: {
                formatter: function() {
							 if (this.series.name == 'average') {
							   return '<strong>Average ' + this.y.toFixed(2) +'</strong><br/>' +
							          'Over the last ' + gCALC.getAvgSize() + ' weeks';
							 }
							 else {
							   var locDate = new Date(this.x);
							 
						       return '<strong>'+ this.series.name + " " + 
							           this.y.toFixed(2) +'<br/>Week ending </strong>'+ 
									   locDate.toLocaleDateString();
							 }
                }
            },
            legend: {
				enabled: showLegend,
				floating: true,
				verticalAlign: 'top',
				itemWidth: 80,
				align: 'right'
            },
            series: [{
                name: 'actual',
				type: 'column',
				color: 'darkred',
                data: actual
            },{
                name: 'average',
				type: 'line',
				color: 'darkblue',
                data: [[actual[0][0], average], [actual[actual.length-1][0], average]],
				dashStyle: 'Dash'
            }]
        });
  return chart;
}

function buildCycleChart(actual, renderTo) {
  if (actual.length == 0) return;
  
  var chart = new Highcharts.Chart({
            chart: {
                renderTo: renderTo,
                marginRight: 40,
                marginBottom: 40
            },
            title: {
                text: 'Average Cycle Time',
                x: -20 //center
            },
            subtitle: {
                text: getProjName(),
                x: -20
            },
			plotOptions: {
			  series: {
			    marker: {  
				   radius: 5
				}
			  }
			},
            xAxis: {
                title: {
                    text: 'Story Estimate'
                },
				min: 0,
				tickPixelInterval : 50,
				gridLineWidth: 1,
				gridLineDashStyle: 'Dash',
                plotLines: [{
                    value: 0,
                    width: 1,
                    color: '#808080'
                }]
            },
            yAxis: {
                title: {
                    text: 'Days'
                },
				min: 0,
				tickPixelInterval : 30,
				gridLineDashStyle: 'Dash',
                plotLines: [{
                    value: 0,
                    width: 1,
                    color: '#808080'
                }]
            },
            tooltip: {
                formatter: function() {
						   return '<strong>' + this.series.name + " for " + this.x.toFixed(0) + " is " + this.y.toFixed(2) + '</strong>';
                }
            },
            legend: {
                enabled: false
            },
            series: [{
                name: 'Cycle Time',
				type: 'line',
				color: 'darkblue',
                data: actual
            }]
        });
  return chart;
}

function buildDefectChart(actual) {
  if (actual.length == 0) return;
  
  var total = 0;
  for (var incr = 0; incr < actual.length; incr++) total += (actual[incr][1] != null) ? actual[incr][1] : 0;
  var title = 'Open Defect Aging (' + total + ')';
  
  var chart = new Highcharts.Chart({
            chart: {
                renderTo: 'aging',
                marginRight: 40,
                marginBottom: 40
            },
            title: {
                text: title,
                x: -20 //center
            },
            subtitle: {
                text: getProjName(),
                x: -20
            },
			plotOptions: {
			  series: {
			    marker: {  
				   radius: 1
				}
			  }
			},
            xAxis: {
                title: {
                    text: 'Days Old'
                },
            },
            yAxis: {
                title: {
                    text: 'Number of Defects'
                },
				min: 0,
				tickPixelInterval : 30,
				gridLineDashStyle: 'Dash',
                plotLines: [{
                    value: 0,
                    width: 1,
                    color: '#808080'
                }]
            },
            tooltip: {
                formatter: function() {
						   return '<strong>' + this.y.toFixed(0) + " defects aged " + this.x.toFixed(0) + " days" + '</strong>';
                }
            },
            legend: {
                enabled: false
            },
            series: [{
                name: 'Aging',
				type: 'column',
				color: 'darkblue',
                data: actual
            }]
        });
  return chart;
}

function buildResourceChart(actual) {
  if (actual.length < 3) return;
  
  var chart = new Highcharts.Chart({
            chart: {
                renderTo: 'resource',
                marginRight: 25,
                marginBottom: 25,
				type: 'column'
            },
            title: {
                text: 'Resource Utilization (MOCK)',
                x: -20 //center
            },
            subtitle: {
                text: getProjName(),
                x: -20
            },
			plotOptions: {
			    column: {
			        stacking: 'normal'
			    }
			},
            xAxis: {
                type: 'datetime'
            },
            yAxis: {
                title: {
                    text: ''
                },
				min: 0,
				tickPixelInterval : 40,
				gridLineDashStyle: 'Dash',
                plotLines: [{
                    value: 0,
                    width: 1,
                    color: '#808080'
                }]
            },
            tooltip: {
                formatter: function() {
							   var locDate = new Date(this.x);
							 
						       return '<strong>'+ locDate.toLocaleDateString() + '</strong><br/>' + 
							          this.series.name +': ' + this.y + 
							          '<br/>Total: ' + this.point.stackTotal;
							 }
            },
            legend: {
                enabled: false
            },
            series: [{
                name: 'New Development',
				color: 'midnightblue',
                data: actual[0]
            },{
                name: 'Maintenance',
				color: '#669933',
                data: actual[1]
            },{
                name: 'OPS Support',
				color: '#CC6600',
                data: actual[2]
            }]
        });
  return chart;
}

function loadMetricsPages() {
  var compute = initCompute();
  //showWaiting();
  
  updateIssues(compute);
  updateBug(compute);

  var projName = getProjName();
  initLoadVeloData(projName, compute);
  initLoadBurndown(projName, compute);
  initLoadCycleData(projName, compute);
  initLoadImpact("", compute);
		
  updateStory(compute);
  storePageValues();
  
  document.getElementById("loadData").value = "Refresh";
  setTimeout(function(){clearWait()}, WAIT*5);
}

function clearWait() {
  var stop = true;

  if (gCALC.getValue('burndown') == 0) stop = false;
  if (gCALC.getValue('cycles') == 0) stop = false;
  if (gCALC.getValue('velocity') == 0) stop = false;
  if (gCALC.getValue('impact') == 0) stop = false;

  if (stop == false) {
    setTimeout(function(){clearWait()}, WAIT*5);
  }
  else {
    stopWaiting();
  }
}

function stopMetricsPages() {
  gCALC.setValue('burndown', -1);
  gCALC.getValue('cycles', -1);
  gCALC.getValue('velocity', -1);
  gCALC.getValue('impact', -1);

  stopWaiting();
}

var stopped = true;
function showWaiting() {
  var overlay = document.createElement("div");
  overlay.setAttribute("id", "overlay");
  overlay.setAttribute("class", "overlay");
  document.body.appendChild(overlay);

  var btn = document.createElement("input");
  btn.setAttribute("type", "button");
  btn.setAttribute("id", "stopCalc");
  btn.setAttribute("class", "stopCalc");
  btn.setAttribute("value", "Stop Compute");
  btn.setAttribute("title", "Stop current calculation");
  btn.onclick = stopMetricsPages;
  overlay.appendChild(btn);

  var wheel = document.createElement("img");
  wheel.setAttribute("id", "wheel");
  wheel.setAttribute("class", "wheel");
  wheel.setAttribute("src", "spinningWheel.gif");
  overlay.appendChild(wheel);

  stopped = false;
}

function stopWaiting() {
  if (stopped == true) return;

  try {
    document.body.removeChild(document.getElementById("overlay"));
  }
  catch (error) {
    console.log (error);
  }

  stopped = true;
}

function syncJIRA() {
  var URL = JIRAREST + 'search?jql=project=eng';
  console.log ("URL: ", URL);
  $.ajax({
    url: URL,
    headers: getJiraHeaders(),
	contentType: 'application/json',
	type: 'GET',
    dataType: 'jsonp',
    success: function(result) {
	  console.log(JSON.stringify(result, null, 4));   // Debug json results
	},
	error: function(err) {
	  console.log("Error:" + err);
	}
  });
}

// window/page handlers
$(function() {
  $(document).tooltip();
});

$(document).ready(function() {
   $("#projData").submit(function(e) {
     e.preventDefault();
   });
	
   $("#projectName").change(function(e) {
      document.getElementById("loadData").value = "Compute";
   }); 
	
   $("#loadData").click(function(e) {
         loadMetricsPages();
    }); 
	
	$("#prefs").click(function(e) {
	  updatePrefs(gCALC, false);
	  loadMetricsPages();
	});
	
	$("#resetPrefs").click(function(e) {
	  updatePrefs(gCALC, true);
	  loadMetricsPages();
	});
	
	$("#clearStorage").click(function(e) {
	  clearStorage();
	});
	
	$("#burnZoom").click(function(e) {
	  zoomChart("Project Burndown", "Burndown", buildBurnChart, gCALC.getData('burndown'), gCALC.getData('velocity'));
	});
	
	$("#veloZoom").click(function(e) {
	  zoomChart("Team Velocity", "Velocity", buildVelocityChart, gCALC.getData('velocity'), null);
	});
	
	$("#impactZoom").click(function(e) {
	  zoomChart("Story Impact", "Impact", buildImpactChart, gCALC.getData('impact'), null);
	});
	
	$("#storyList").click(function(e) {
      zoomList("storyList", "storyData", formatStory, gCALC.getData('story'));
	});
	
	$("#defectList").click(function(e) {
      zoomList("defectList", "bugData", formatDefects, gCALC.getData('defect'));
	});
	
	$("#issueList").click(function(e) {
	  zoomList("issueList", "issueData", formatIssues, gCALC.getData('issues'));
	});
	
	$("#sync").click(function(e) {
	  syncJIRA();
	});
});

function zoomChart(title, newValue, chartFunc, data, supportData) {
  document.getElementById("zoomLegend").innerHTML = title;
  var chart = chartFunc(data, supportData, "zoom");
  showTabValue("zoomTab");
  changeTabValue("zoomTab", newValue);
}

function zoomList(element, display, formatFunc, data) {
  var fullList = (document.getElementById(element).value == "+");
  document.getElementById(element).value = (fullList) ? "-" : "+";
  document.getElementById(display).innerHTML = formatFunc(data, fullList);
}

function updateStatus(visible) {
  if (visible == true) {
    var status = computeStatus();
	
	document.getElementById("statusText").innerHTML = status.text;
    document.getElementById("status").style.visibility = "visible";
    document.getElementById("status").style.backgroundColor = status.value;
  }
  else {
    document.getElementById("status").style.visibility = "hidden";
  }
}

function updatePrefs(pageVal, reset) {
  if (reset == true) {
    gCALC.setAvgSize(-1);
    document.getElementById("average").value = gCALC.getAvgSize();

	gCALC.setIncrement(-1);
	if (gCALC.getIncrement() == 1) {
	  document.getElementById("one").checked = true;
	}
	else {
	  document.getElementById("two").checked = true;
	}
  }
 
  pageVal.avgSize = document.getElementById("average").value;
  if (document.getElementById("one").checked == true) {
	pageVal.velIncr = 1;
  }
  else {
	pageVal.velIncr = 2;
  }
}

function initPageData() {
	loadProjList();
}
